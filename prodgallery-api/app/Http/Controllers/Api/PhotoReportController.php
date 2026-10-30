<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhotoReport;
use Illuminate\Http\Request;

class PhotoReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'photo_id' => 'required|integer|exists:photos,id',
            'reason' => 'required|in:copyright,inappropriate,misleading,other',
            'details' => 'nullable|string|max:3000',
        ]);

        $report = PhotoReport::create([
            ...$validated,
            'user_id' => $request->user()?->id,
        ]);

        return response()->json(['message' => 'Your report has been submitted for review.', 'report_id' => $report->id], 201);
    }
}
