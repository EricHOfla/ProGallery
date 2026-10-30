<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\OrderItem;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('items.photo')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with('items.photo')->findOrFail($id);
        
        // Authorize that the user can view this order
        $this->authorize('view', $order);

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|max:50',
            'shipping_address' => 'required|array',
            'billing_address' => 'nullable|array',
        ]);

        $order = DB::transaction(function () use ($request, $validated) {
            $settings = StoreSetting::values();
            // Lock cart rows to prevent concurrent checkout requests from duplicating an order.
            $cartItems = Cart::with('photo')
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                abort(response()->json(['message' => 'Cart is empty'], 422));
            }

            if ($cartItems->contains(fn ($item) => !$item->photo || !$item->photo->is_active)) {
                abort(response()->json(['message' => 'One or more photos are no longer available. Refresh your cart and try again.'], 422));
            }

            // Compute prices from the database, never from browser-submitted totals.
            $licenseMultiplier = fn ($license) => (float) ($settings[$license . '_license_multiplier'] ?? match ($license) { 'commercial' => 2, 'extended' => 5, default => 1 });
            // Round each unit price to the currency's two-decimal precision before
            // summing, so the order total matches the line items charged by Stripe.
            $unitPriceFor = fn ($item) => round((float) $item->photo->price * $licenseMultiplier($item->license_type ?? 'personal'), 2);
            $totalAmount = round($cartItems->sum(fn ($item) => $unitPriceFor($item) * (int) $item->quantity), 2);

            $createdOrder = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => 'ORD-' . Str::upper(Str::random(10)),
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'shipping_address' => $validated['shipping_address'],
                'billing_address' => $validated['billing_address'] ?? null,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $createdOrder->id,
                    'photo_id' => $item->photo_id,
                    'quantity' => $item->quantity,
                    'price' => $unitPriceFor($item),
                    'license_type' => $item->license_type ?? 'personal',
                ]);
            }

            Cart::where('user_id', $request->user()->id)->delete();

            return $createdOrder->load('items.photo');
        }, 3);

        try {
            Mail::raw(
                "We received order {$order->order_number}. Total: {$order->total_amount}. Payment is still pending until your payment provider confirms it.",
                function ($message) use ($request, $order) {
                    $message->to($request->user()->email)
                        ->subject('Order received - ' . $order->order_number);
                }
            );
        } catch (\Throwable $exception) {
            Log::error('Order notification email failed', [
                'order_id' => $order->id,
                'exception' => $exception->getMessage(),
            ]);
        }

        return response()->json($order, 201);
    }

    public function createPaymentSession(Request $request, $id)
    {
        $order = Order::with('items.photo', 'user')->findOrFail($id);
        $this->authorize('view', $order);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'This order has already been paid.'], 409);
        }

        if (in_array($order->payment_status, ['refunded', 'refund_pending'], true) || $order->status === 'cancelled') {
            return response()->json(['message' => 'Payment cannot be started for a cancelled or refunded order.'], 409);
        }

        if ($order->items->isEmpty()) {
            return response()->json(['message' => 'This order has no items and cannot be paid.'], 422);
        }

        $secret = (string) config('services.stripe.secret');
        if ($secret === '') {
            return response()->json(['message' => 'Online payment is not configured yet. Please contact the store.'], 503);
        }

        $frontendUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $form = [
            'mode' => 'payment',
            'success_url' => $frontendUrl . '/order/' . $order->id . '?payment=success',
            'cancel_url' => $frontendUrl . '/order/' . $order->id . '?payment=cancelled',
            'customer_email' => $order->user->email,
            'client_reference_id' => (string) $order->id,
            'metadata[order_id]' => (string) $order->id,
            'payment_intent_data[metadata][order_id]' => (string) $order->id,
        ];

        foreach ($order->items as $index => $item) {
            $form["line_items[$index][price_data][currency]"] = strtolower((string) config('services.stripe.currency', 'usd'));
            $form["line_items[$index][price_data][unit_amount]"] = (string) round((float) $item->price * 100);
            $form["line_items[$index][price_data][product_data][name]"] = ($item->photo?->title ?? 'Photo') . ' (' . ucfirst($item->license_type ?? 'personal') . ' license)';
            $form["line_items[$index][quantity]"] = (string) $item->quantity;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withToken($secret)
                ->asForm()
                ->timeout(20)
                ->post('https://api.stripe.com/v1/checkout/sessions', $form);
        } catch (\Throwable $exception) {
            \Illuminate\Support\Facades\Log::warning('Stripe Checkout session request failed', [
                'order_id' => $order->id,
                'exception' => $exception->getMessage(),
            ]);
            return response()->json(['message' => 'The payment provider could not be reached. Please try again.'], 502);
        }

        if (!$response->successful() || empty($response->json('url')) || empty($response->json('id'))) {
            \Illuminate\Support\Facades\Log::error('Stripe Checkout session creation failed', ['order_id' => $order->id, 'status' => $response->status()]);
            return response()->json(['message' => 'Could not start secure payment. Please try again later.'], 502);
        }

        $order->update(['payment_provider_session_id' => $response->json('id')]);

        return response()->json(['url' => $response->json('url'), 'session_id' => $response->json('id')]);
    }

    public function invoice(Request $request, $id)
    {
        $order = Order::with('items.photo')->findOrFail($id);
        
        // Authorize that the user can download the invoice
        $this->authorize('downloadInvoice', $order);

        if ($order->status !== 'completed' || $order->payment_status !== 'paid') {
            return response()->json(['message' => 'Invoice is available after confirmed payment.'], 403);
        }

        $shipping = $order->shipping_address ?? [];
        $billing = $order->billing_address ?: $shipping;

        $escape = function ($value) {
            return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
        };

        $formatAddress = function ($address) use ($escape) {
            $name = trim(($address['first_name'] ?? '') . ' ' . ($address['last_name'] ?? ''));
            $lines = array_filter([
                $name,
                $address['email'] ?? '',
                $address['phone'] ?? '',
                $address['address'] ?? ($address['street'] ?? ''),
                trim(($address['city'] ?? '') . ' ' . ($address['zip'] ?? ($address['zip_code'] ?? ''))),
                $address['country'] ?? '',
            ]);

            $safeLines = array_map($escape, $lines);
            return implode('<br>', $safeLines);
        };

        $itemsHtml = '';
        $subtotal = 0;
        foreach ($order->items as $item) {
            $title = $escape($item->photo?->title ?? 'Item');
            $qty = (int) $item->quantity;
            $price = (float) $item->price;
            $lineTotal = $price * $qty;
            $subtotal += $lineTotal;
            $itemsHtml .= '<tr>'
                . '<td>' . $title . '</td>'
                . '<td style="text-align:center;">' . $qty . '</td>'
                . '<td style="text-align:right;">$' . number_format($price, 2) . '</td>'
                . '<td style="text-align:right;">$' . number_format($lineTotal, 2) . '</td>'
                . '</tr>';
        }

        $tax = 0;
        $shippingCost = 0;
        $total = $subtotal + $tax + $shippingCost;

        $invoiceNumber = $order->order_number ?? ('ORD-' . $order->id);
        $companyName = config('app.name', 'ProdGallery');
        $logoUrl = url('/logo/prodgallery-logo.jpeg');

        $html = '<!DOCTYPE html>'
            . '<html lang="en">'
            . '<head>'
            . '<meta charset="UTF-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            . '<title>Invoice ' . $escape($invoiceNumber) . '</title>'
            . '<style>'
            . 'body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:24px;background:#f3f4f6;}'
            . '.page{max-width:980px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.06);padding:32px;}'
            . '.topbar{height:8px;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:10px 10px 0 0;margin:-32px -32px 24px -32px;}'
            . '.header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:20px;}'
            . '.brand{display:flex;flex-direction:column;align-items:flex-start;gap:6px;}'
            . '.brand img{height:60px;width:auto;display:block;}'
            . '.subtitle{font-size:12px;color:#6b7280;margin-top:2px;}'
            . '.meta{font-size:13px;color:#374151;text-align:right;}'
            . '.meta strong{color:#111;}'
            . '.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#ecfdf3;color:#166534;font-weight:600;font-size:12px;border:1px solid #bbf7d0;}'
            . '.section{margin-top:24px;}'
            . '.section h3{margin:0 0 10px 0;font-size:15px;color:#111;text-transform:uppercase;letter-spacing:0.8px;}'
            . '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}'
            . '.box{border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;font-size:13px;color:#374151;line-height:1.5;background:#fafafa;}'
            . '.info-row{display:flex;gap:16px;flex-wrap:wrap;margin-top:6px;font-size:12px;color:#6b7280;}'
            . '.pill{padding:6px 10px;border-radius:999px;background:#f9fafb;border:1px solid #e5e7eb;color:#374151;}'
            . 'table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;}'
            . 'th,td{padding:12px;border-bottom:1px solid #eee;vertical-align:top;}'
            . 'th{text-align:left;background:#f8fafc;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;}'
            . 'tr:last-child td{border-bottom:none;}'
            . '.totals{margin-top:16px;display:flex;justify-content:flex-end;}'
            . '.totals table{width:320px;}'
            . '.totals td{border:none;padding:6px 0;font-size:13px;}'
            . '.totals .label{color:#6b7280;}'
            . '.totals .value{text-align:right;font-weight:600;color:#111;}'
            . '.total-row .value{font-size:16px;color:#0f766e;}'
            . '.footer{margin-top:28px;font-size:12px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;}'
            . '@media print{body{background:#fff;padding:0;} .page{box-shadow:none;border:none;border-radius:0;} .topbar{margin:0 0 16px 0;border-radius:0;}}'
            . '</style>'
            . '</head>'
            . '<body>'
            . '<div class="page">'
            . '<div class="topbar"></div>'
            . '<div class="header">'
            . '<div>'
            . '<div class="brand">'
            . '<img src="' . $escape($logoUrl) . '" alt="' . $escape($companyName) . '" />'
            . '<div class="subtitle">Professional Photo Marketplace</div>'
            . '</div>'
            . '<div class="info-row">'
            . '<span class="pill">Invoice</span>'
            . '<span class="pill">Order ' . $escape($invoiceNumber) . '</span>'
            . '</div>'
            . '</div>'
            . '<div class="meta">'
            . '<div><strong>Invoice No:</strong> ' . $escape($invoiceNumber) . '</div>'
            . '<div><strong>Date:</strong> ' . $escape($order->created_at->format('M d, Y H:i')) . '</div>'
            . '<div><strong>Payment:</strong> ' . $escape($order->payment_method) . '</div>'
            . '<div style="margin-top:8px;"><span class="badge">' . $escape(ucfirst($order->status)) . '</span></div>'
            . '</div>'
            . '</div>'

            . '<div class="section grid">'
            . '<div>'
            . '<h3>Billing</h3>'
            . '<div class="box">' . $formatAddress($billing) . '</div>'
            . '</div>'
            . '<div>'
            . '<h3>Shipping</h3>'
            . '<div class="box">' . $formatAddress($shipping) . '</div>'
            . '</div>'
            . '</div>'

            . '<div class="section">'
            . '<h3>Items</h3>'
            . '<table>'
            . '<thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Line Total</th></tr></thead>'
            . '<tbody>' . $itemsHtml . '</tbody>'
            . '</table>'
            . '</div>'

            . '<div class="totals">'
            . '<table>'
            . '<tr><td class="label">Subtotal</td><td class="value">$' . number_format($subtotal, 2) . '</td></tr>'
            . '<tr><td class="label">Tax</td><td class="value">$' . number_format($tax, 2) . '</td></tr>'
            . '<tr><td class="label">Shipping</td><td class="value">$' . number_format($shippingCost, 2) . '</td></tr>'
            . '<tr class="total-row"><td class="label">Total</td><td class="value">$' . number_format($total, 2) . '</td></tr>'
            . '</table>'
            . '</div>'

            . '<div class="footer">Thank you for your purchase. For support, reply to this invoice email or contact our team.</div>'
            . '</div>'
            . '<script>window.addEventListener("load",function(){window.print();});</script>'
            . '</body>'
            . '</html>';

        return response($html)->header('Content-Type', 'text/html');
    }

    public function downloadImages(Request $request, $id)
    {
        $order = Order::with('items.photo')->findOrFail($id);
        
        // Authorize that the user can download the images
        $this->authorize('downloadImages', $order);

        // Only allow download if order is completed
        if ($order->status !== 'completed' || $order->payment_status !== 'paid') {
            return response()->json(['message' => 'Images are only available after confirmed payment'], 403);
        }

        $items = $order->items;
        if ($items->isEmpty()) {
            return response()->json(['message' => 'No items in this order'], 400);
        }

        // Create a temporary directory for the zip
        $tempDir = storage_path('app' . DIRECTORY_SEPARATOR . 'temp' . DIRECTORY_SEPARATOR . 'downloads');
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }

        $zipFileName = 'order_' . $order->id . '_images_' . time() . '.zip';
        $zipFilePath = $tempDir . DIRECTORY_SEPARATOR . $zipFileName;

        $zip = new \ZipArchive();
        if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Failed to create zip file'], 500);
        }

        try {
            $fileCount = 0;
            foreach ($items as $item) {
                if ($item->photo && $item->photo->image) {
                    $imageUrl = trim($item->photo->image);
                    $actualPath = null;

                    // Parse the storage URL to get the relative path
                    // URL format: /storage/photos/filename.ext
                    if (preg_match('#(?:^|/)storage/(.+)$#', $imageUrl, $matches)) {
                        $relativePath = ltrim($matches[1], '/');
                        $publicStorageRoot = realpath(storage_path('app' . DIRECTORY_SEPARATOR . 'public'));
                        $candidatePath = storage_path('app' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath));
                        $resolvedPath = realpath($candidatePath);

                        // Never allow a stored image path to escape Laravel's public storage directory.
                        if ($publicStorageRoot && $resolvedPath && str_starts_with($resolvedPath, $publicStorageRoot . DIRECTORY_SEPARATOR)) {
                            $actualPath = $resolvedPath;
                        }
                    }

                    // Verify the file exists before adding
                    if ($actualPath && is_file($actualPath) && is_readable($actualPath)) {
                        // Use photo title for filename with extension
                        $ext = pathinfo($actualPath, PATHINFO_EXTENSION);
                        $fileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $item->photo->title) . '_' . $item->id . '.' . $ext;
                        $zip->addFile($actualPath, $fileName);
                        $item->photo->increment('downloads_count');
                        $fileCount++;
                    }
                }
            }
            $zip->close();

            if ($fileCount === 0) {
                if (file_exists($zipFilePath)) {
                    unlink($zipFilePath);
                }
                return response()->json(['message' => 'No images found. Check if photos are linked to this order.'], 400);
            }

            // Return the zip file for download
            return response()->download($zipFilePath, $zipFileName, [
                'Content-Type' => 'application/zip',
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            if (file_exists($zipFilePath)) {
                @unlink($zipFilePath);
            }
            Log::error('Order image archive creation failed', [
                'order_id' => $order->id,
                'exception' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Failed to prepare the download. Please try again or contact support.'], 500);
        }
    }
}
