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
        // Message::factory()->count(50)->create();
        for ($i = 10; $i >=0 ; $i--) {
            for ($j = 10; $j >= 0; $j--) {
                Message::factory()->create(['created_at' => Carbon::now()->subDays($i)->subHours($j)]);
            }
        }
    }
}
