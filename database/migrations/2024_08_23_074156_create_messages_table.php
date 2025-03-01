<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('content', 12000);
            $table->foreignId('channel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('user_name')->nullable();
            $table->boolean('is_auto_generated')->default(false);
            $table->boolean('is_edited')->default(false);
            $table->unsignedBigInteger('forwarded_message_id')->nullable()->index();
            $table->foreign('forwarded_message_id')->references('id')->on('messages')->onDelete('cascade');
            $table->unsignedBigInteger('threaded_message_id')->nullable()->index();
            $table->foreign('threaded_message_id')->references('id')->on('messages')->onDelete('cascade');
            $table->softDeletes();
            $table->timestamps(3);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
