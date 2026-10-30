<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate(['email' => 'required|email:rfc|max:255']);
        $subscriber = NewsletterSubscriber::withTrashed()->where('email', strtolower($validated['email']))->first();

        if (!$subscriber) {
            $subscriber = NewsletterSubscriber::create([
                'email' => strtolower($validated['email']),
                'unsubscribe_token' => Str::random(64),
                'subscribed_at' => now(),
            ]);
        } elseif ($subscriber->unsubscribed_at) {
            $subscriber->update(['unsubscribed_at' => null, 'subscribed_at' => now()]);
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
