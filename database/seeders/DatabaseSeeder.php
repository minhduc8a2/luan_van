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



        $user = User::find(1);

        $user->ownWorkspaces()->createMany([
            ['name' => 'Main'],
            ['name' => 'Duc Company'],
        ]);
        $user->workspaces()->attach(1);

        $user->workspaces()->attach(2);

        $user->ownWorkspaces->map(function ($wsp, $key) {
            $workspace = Workspace::find($wsp->id);
            $user = User::find(1);

            $workspace->channels()->createMany([
                [
                    'name' => 'all-' . $workspace->name,
                    'description' => Channel::createChannelDescription('all', ''),
                    'type' => 'PUBLIC',
                    'user_id' => 1,
                    'is_main_channel' => true
                ],
                [
                    'name' => 'work',
                    'description' => Channel::createChannelDescription('', 'work'),
                    'type' => 'PUBLIC',
                    'user_id' => 1
                ],
                [
                    'name' => 'social',
                    'description' => Channel::createChannelDescription('social', ''),
                    'type' => 'PUBLIC',
                    'user_id' => 1
                ],

            ]);

            $workspace->assignUserToPublicChannels($user);
            $workspace->createAndAssignSelfChannelsForUser($user);
        });
        $this->call(MessageSeeder::class);
    }
}
