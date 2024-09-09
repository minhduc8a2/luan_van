<?php

namespace Database\Seeders;

use App\Helpers\Helper;
use App\Models\Message;
use Illuminate\Support\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Message::factory()->count(50)->sequence(fn(Sequence $sequence) => [
            "created_at" => ceil($sequence->index % 2) == 0 ? Carbon::now()->addMinutes(random_int(24, 10000)) : Carbon::now()->subMinutes(random_int(24, 10000))
        ])->create();
    }
}
