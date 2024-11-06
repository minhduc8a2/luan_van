<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(
            ['name' => 'ADMIN']
        );
        Role::create(
            ['name' => 'MANAGER']
        );
        Role::create(
            ['name' => 'MEMBER']
        );
       
    }
}
