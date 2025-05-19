<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PlantDiseaseController extends Controller
{
    public function predict(Request $request)
    {
        // Validate the request
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        try {
            // Forward the image to Python API
            $response = Http::attach(
                'image', 
                file_get_contents($request->file('image')), 
                'plant.jpg'
            )->post('http://localhost:5000/predict');

            return $response->json();

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


