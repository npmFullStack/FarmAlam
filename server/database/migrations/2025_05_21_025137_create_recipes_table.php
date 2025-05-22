<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->enum('category', ['appetizer', 'main course', 'dessert', 'salad', 'soup', 'side dish', 'breakfast', 'beverage']);
            $table->enum('servings', ['1', '2', '4', '8+']);
            $table->string('image')->nullable();
            $table->integer('prep_time')->comment('in minutes');
            $table->integer('cook_time')->comment('in minutes');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('recipes');
    }
};