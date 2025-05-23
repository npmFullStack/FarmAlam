<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Step;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecipeController extends Controller
{
 public function index()
{
    $recipes = Recipe::with(['user', 'ratings'])
        ->withAvg('ratings as ratings_avg_rating', 'rating')
        ->get()
        ->map(function ($recipe) {
            $recipe->ratings_avg_rating = (float) $recipe->ratings_avg_rating;
            return $recipe;
        });

    // Add saved status for authenticated users
    if ($userId = auth()->id()) {
        $savedRecipeIds = Cookbook::where('user_id', $userId)
            ->where('status', 1)
            ->pluck('recipe_id')
            ->toArray();

        foreach ($recipes as $recipe) {
            $recipe->is_saved = in_array($recipe->id, $savedRecipeIds);
        }
    }

    return response()->json($recipes);
}

 public function store(Request $request)
 {
  $validator = Validator::make($request->all(), [
   "name" => "required|string|max:255",
   "description" => "required|string",
   "category" =>
    "required|in:appetizer,main course,dessert,salad,soup,side dish,breakfast,beverage",
   "servings" => "required|in:1,2,4,8+",
   "image" => "nullable|image|mimes:jpeg,png,jpg,gif|max:2048",
   "prep_time" => "required|integer|min:0",
   "cook_time" => "required|integer|min:0",
   "steps" => "required|array|min:1",
   "steps.*.description" => "required|string",
  ]);

  if ($validator->fails()) {
   return response()->json(
    [
     "message" => "Validation error",
     "errors" => $validator->errors(),
    ],
    422,
   );
  }

  $imagePath = null;
  if ($request->hasFile("image")) {
   $imagePath = $request->file("image")->store("recipe_images", "public");
  }

  $recipe = Recipe::create([
   "user_id" => auth()->id(),
   "name" => $request->name,
   "description" => $request->description,
   "category" => $request->category,
   "servings" => $request->servings,
   "image" => $imagePath,
   "prep_time" => $request->prep_time,
   "cook_time" => $request->cook_time,
  ]);

  foreach ($request->steps as $index => $stepData) {
   $recipe->steps()->create([
    "description" => $stepData["description"],
    "order" => $index + 1,
   ]);
  }

  return response()->json(
   [
    "message" => "Recipe created successfully",
    "recipe" => $recipe->load("steps"),
   ],
   201,
  );
 }

 public function show(Recipe $recipe)
 {
  try {
   $recipe->load([
    "steps" => function ($query) {
     $query->orderBy("order");
    },
    "user",
   ]);

   $averageRating = $recipe->ratings()->avg("rating");

   return response()->json([
    ...$recipe->toArray(),
    "average_rating" => (float) $averageRating,
   ]);
  } catch (\Exception $e) {
   return response()->json(
    [
     "message" => "Failed to fetch recipe",
     "error" => $e->getMessage(),
    ],
    500,
   );
  }
 }
 public function update(Request $request, Recipe $recipe)
 {
  if ($recipe->user_id !== auth()->id()) {
   return response()->json(["message" => "Unauthorized"], 403);
  }

  $validator = Validator::make($request->all(), [
   "name" => "sometimes|required|string|max:255",
   "description" => "sometimes|required|string",
   "category" =>
    "sometimes|required|in:appetizer,main course,dessert,salad,soup,side dish,breakfast,beverage",
   "servings" => "sometimes|required|in:1,2,4,8+",
   "image" => "nullable|sometimes|image|mimes:jpeg,png,jpg,gif|max:2048",
   "prep_time" => "sometimes|required|integer|min:1",
   "cook_time" => "sometimes|required|integer|min:1",
   "steps" => "sometimes|required|array|min:1",
   "steps.*.description" => "required|string",
  ]);

  if ($validator->fails()) {
   return response()->json(
    [
     "message" => "Validation error",
     "errors" => $validator->errors(),
    ],
    422,
   );
  }

  $updateData = $request->only([
   "name",
   "description",
   "category",
   "servings",
   "prep_time",
   "cook_time",
  ]);

  // Handle image upload
  if ($request->hasFile("image")) {
   // Delete old image if it exists
   if ($recipe->image) {
    \Storage::disk("public")->delete($recipe->image);
   }

   // Store new image
   $updateData["image"] = $request
    ->file("image")
    ->store("recipe_images", "public");
  } elseif ($request->has("image") && $request->image === null) {
   // Handle case when image is explicitly set to null (removed)
   if ($recipe->image) {
    \Storage::disk("public")->delete($recipe->image);
   }
   $updateData["image"] = null;
  }
  // Else: keep existing image (don't modify it)

  $recipe->update($updateData);

  if ($request->has("steps")) {
   $recipe->steps()->delete();
   foreach ($request->steps as $index => $stepData) {
    $recipe->steps()->create([
     "description" => $stepData["description"],
     "order" => $index + 1,
    ]);
   }
  }

  return response()->json([
   "message" => "Recipe updated successfully",
   "recipe" => $recipe->load("steps"),
  ]);
 }

 public function destroy(Recipe $recipe)
 {
  if ($recipe->user_id !== auth()->id()) {
   return response()->json(["message" => "Unauthorized"], 403);
  }

  $recipe->delete();
  return response()->json(["message" => "Recipe deleted successfully"]);
 }
}
