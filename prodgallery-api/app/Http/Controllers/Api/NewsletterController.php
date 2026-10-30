<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate(['email' => 'required|email:rfc|max:255']);
        $subscriber = NewsletterSubscriber::where('email', strtolower($validated['email']))->first();
        $shouldNotify = !$subscriber || $subscriber->unsubscribed_at !== null;

        if (!$subscriber) {
            $subscriber = NewsletterSubscriber::create([
                'email' => strtolower($validated['email']),
                'unsubscribe_token' => Str::random(64),
                'subscribed_at' => now(),
            ]);
        } elseif ($subscriber->unsubscribed_at) {
            $subscriber->update(['unsubscribed_at' => null, 'subscribed_at' => now()]);
        }

        if ($shouldNotify) try {
            $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
            Mail::raw(
                "Thank you for subscribing to ProGallery updates. You can unsubscribe at: {$frontendUrl}/newsletter/unsubscribe?token={$subscriber->unsubscribe_token}",
                fn ($message) => $message->to($subscriber->email)->subject('Welcome to ProGallery updates')
            );
        } catch (\Throwable $exception) {
            Log::warning('Newsletter confirmation email failed', ['subscriber_id' => $subscriber->id, 'exception' => $exception->getMessage()]);
        }

        return response()->json(['message' => 'You are subscribed to ProGallery updates.'], 201);
    }

    public function unsubscribe(Request $request)
    {
        $validated = $request->validate(['token' => 'required|string|size:64']);
        $subscriber = NewsletterSubscriber::where('unsubscribe_token', $validated['token'])->firstOrFail();
        $subscriber->update(['unsubscribed_at' => now()]);
        return response()->json(['message' => 'You have been unsubscribed.']);
    }
}
