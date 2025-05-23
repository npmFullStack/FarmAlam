<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cookbook', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('recipe_id')->constrained('recipes')->onDelete('cascade');
            $table->tinyInteger('status')->default(1); // 1 = active, 0 = deleted
            $table->timestamps();
            
            $table->unique(['user_id', 'recipe_id']); // Prevent duplicate entries
        });
    }

    public function down()
    {
        Schema::dropIfExists('cookbook');
    }
};