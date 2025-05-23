<?php

namespace App\Http\Controllers;

use App\Models\Cookbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CookbookController extends Controller
{
 public function index()
{
    $userId = Auth::id();
    
    $savedRecipes = Cookbook::where('user_id', $userId)
        ->where('status', 1)
        ->with(['recipe' => function($query) {
            $query->with(['user', 'ratings']);
        }])
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->recipe->id,
                'name' => $item->recipe->name,
                'image' => $item->recipe->image,
                'category' => $item->recipe->category,
                'prep_time' => $item->recipe->prep_time,
                'cook_time' => $item->recipe->cook_time,
                'servings' => $item->recipe->servings,
                'average_rating' => $item->recipe->ratings->avg('rating'),
                'user' => [
                    'username' => $item->recipe->user->username,
                    'profile_picture' => $item->recipe->user->profile_picture
                ]
            ];
        });
        
    return response()->json($savedRecipes);
}

 public function store(Request $request)
 {
  $request->validate([
   "recipe_id" => "required|exists:recipes,id",
  ]);

  $userId = Auth::id();

  // Check if already saved
  $existing = Cookbook::where("user_id", $userId)
   ->where("recipe_id", $request->recipe_id)
   ->first();

  if ($existing) {
   if ($existing->status === 0) {
    $existing->update(["status" => 1]);
    return response()->json(["message" => "Recipe added to cookbook"]);
   }
   return response()->json(["message" => "Recipe already in cookbook"]);
  }

  Cookbook::create([
   "user_id" => $userId,
   "recipe_id" => $request->recipe_id,
   "status" => 1,
  ]);

  return response()->json(["message" => "Recipe added to cookbook"]);
 }

 public function destroy($recipeId)
 {
  $userId = Auth::id();

  $entry = Cookbook::where("user_id", $userId)
   ->where("recipe_id", $recipeId)
   ->first();

  if ($entry) {
   $entry->update(["status" => 0]);
   return response()->json(["message" => "Recipe removed from cookbook"]);
  }

  return response()->json(["message" => "Recipe not found in cookbook"], 404);
 }

 public function bulkDelete(Request $request)
 {
  $request->validate([
   "recipe_ids" => "required|array",
   "recipe_ids.*" => "exists:cookbook,recipe_id,user_id," . Auth::id(),
  ]);

  Cookbook::where("user_id", Auth::id())
   ->whereIn("recipe_id", $request->recipe_ids)
   ->update(["status" => 0]);

  return response()->json(["message" => "Recipes removed from cookbook"]);
 }
}
