<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipe_id' => 'required|exists:recipes,id',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        try {
            $rating = Rating::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'recipe_id' => $validated['recipe_id']
                ],
                ['rating' => $validated['rating']]
            );

            // Calculate fresh average rating
            $averageRating = Rating::where('recipe_id', $validated['recipe_id'])
                ->avg('rating');

            return response()->json([
                'success' => true,
                'message' => 'Rating saved successfully',
                'average_rating' => (float) $averageRating,
                'user_rating' => $rating->rating
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save rating',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function userRating($recipeId)
    {
        try {
            $rating = Rating::where('user_id', Auth::id())
                ->where('recipe_id', $recipeId)
                ->first();

            return response()->json([
                'success' => true,
                'rating' => $rating ? $rating->rating : 0
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rating',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}