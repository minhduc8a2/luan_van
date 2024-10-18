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
        $this->call(RoleSeeder::class);
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


        /**
         * @var Workspace
         */

        $workspace = $user->ownWorkspaces()->create(['name' => 'project']);
        $workspace->assignAdminRoleAndAdminPermissions($user);
        $workspace->createWorkspaceMemberPermissions();
        $workspace->createInitChannels($user, 'project');
        $workspace->createAndAssignSelfChannelForUser($user);


        $this->call(MessageSeeder::class);
    }
}
