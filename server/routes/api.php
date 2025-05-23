<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\CookbookController;

// Public routes
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);

// Public recipe routes (read-only)
Route::get("/recipes", [RecipeController::class, "index"]); // List all recipes
Route::get("/recipes/{recipe}", [RecipeController::class, "show"]); // Show single recipe

// Protected routes
Route::middleware("auth:sanctum")->group(function () {
    // User routes
    Route::get("/user", [AuthController::class, "me"]);
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);

    // Protected recipe routes (modification)
    Route::post("/recipes", [RecipeController::class, "store"]);
    Route::put("/recipes/{recipe}", [RecipeController::class, "update"]);
    Route::delete("/recipes/{recipe}", [RecipeController::class, "destroy"]);

    // Rating routes
    Route::post("/ratings", [RatingController::class, "store"]);
    Route::get("/ratings/{recipeId}", [RatingController::class, "userRating"]);
    
    // Cookbook routes
    Route::get('/cookbook', [CookbookController::class, 'index']);
    Route::post('/cookbook', [CookbookController::class, 'store']);
    Route::delete('/cookbook/{recipeId}', [CookbookController::class, 'destroy']);
    Route::post('/cookbook/bulk-delete', [CookbookController::class, 'bulkDelete']);
});