<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\RatingController;

Route::middleware("auth:sanctum")->group(function () {
 Route::get("/user", [AuthController::class, "me"]);
 Route::post("/logout", [AuthController::class, "logout"]);
Route::post('/user/update', [AuthController::class, 'updateProfile']);
 // Recipe routes
 Route::apiResource("recipes", RecipeController::class);

 // Rating route
 Route::post("/ratings", [RatingController::class, "store"]);
 Route::get("/ratings/{recipeId}", [RatingController::class, "userRating"]);
});

Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);
