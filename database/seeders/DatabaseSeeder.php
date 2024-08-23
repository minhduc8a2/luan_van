<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Message;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        User::factory()->create([
            'name' => 'Lê Minh Đức',
            'email' => 'minhduc8a2.1@gmail.com',
            'password' => '12345678'
        ]);
        User::factory()->create([
            'name' => 'Tony Stark',
            'email' => 'stark@gmail.com',
            'password' => '12345678'
        ]);
        User::factory()->create([
            'name' => 'Thor',
            'email' => 'thor@gmail.com',
            'password' => '12345678'
        ]);
        User::factory()->create([
            'name' => 'Captain',
            'email' => 'captain@gmail.com',
            'password' => '12345678'
        ]);
        Workspace::create([
            'name' => 'Main',
            'user_id' => 1
        ]);
        Workspace::create([
            'name' => 'Duc Company',
            'user_id' => 1
        ]);
        Channel::create([
            'name' => "Data project",
            'type' => 'PUBLIC',
            'workspace_id' => 1,
            'user_id' => 1
        ]);
        Channel::create([
            'name' => "Traffic Model project",
            'type' => 'PRIVATE',
            'workspace_id' => 1,
            'user_id' => 1
        ]);
        for ($i = 1; $i <= 3; $i++) {
            $user = User::find($i);
            $user->workspaces()->attach(1);
            $user->workspaces()->attach(2);
            $user->channels()->attach(1);
            $user->channels()->attach(2);
        }
    }
}
