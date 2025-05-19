<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlantDiseaseController;

// Make sure this route exists
Route::post('/predict', [PlantDiseaseController::class, 'predict']);