<?php

namespace Database\Factories;

use App\Helpers\Helper;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "content" => Helper::contentToJSONContent(fake()->sentence()),
            "user_id" => 1,
            "channel_id" => 1,
            "created_at" => Carbon::now()->subDays(random_int(1, 100))
        ];
    }
}
