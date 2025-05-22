<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
 public function register(Request $request)
 {
  $validator = Validator::make($request->all(), [
   "first_name" => "required|string|max:255",
   "last_name" => "required|string|max:255",
   "username" => "required|string|max:255|unique:users",
   "email" => "required|string|email|max:255|unique:users",
   "password" => "required|confirmed|min:8",
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

  $user = User::create([
   "first_name" => $request->first_name,
   "last_name" => $request->last_name,
   "username" => $request->username,
   "email" => $request->email,
   "password" => Hash::make($request->password),
  ]);

  $token = $user->createToken("auth_token")->plainTextToken;

  return response()->json(
   [
    "message" => "User registered successfully",
    "user" => $user,
    "token" => $token,
    "token_type" => "Bearer",
   ],
   201,
  );
 }

 // Login an existing user
 public function login(Request $request)
 {
  // Validate the request data
  $request->validate([
   "email" => "required|string|email",
   "password" => "required|string",
  ]);

  // Attempt to find the user by email
  $user = User::where("email", $request->email)->first();

  // Check if user exists and password is correct
  if (!$user || !Hash::check($request->password, $user->password)) {
   return response()->json(
    [
     "message" => "Invalid credentials",
    ],
    401,
   );
  }

  // Create token for the user
  $token = $user->createToken("auth_token")->plainTextToken;

  // Return success response with token
  return response()->json([
   "message" => "User logged in successfully",
   "user" => $user,
   "token" => $token,
   "token_type" => "Bearer",
  ]);
 }

 // Logout the authenticated user
 public function logout(Request $request)
 {
  // Revoke all tokens for the authenticated user
  $request
   ->user()
   ->tokens()
   ->delete();

  return response()->json([
   "message" => "Logged out successfully",
  ]);
 }

 public function me(Request $request)
 {
  return response()->json([
   "user" => $request->user(),
   "saved_recipes" => [], // You can add this later when you implement recipe saving
  ]);
 }
}
