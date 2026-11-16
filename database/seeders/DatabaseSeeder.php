<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin User
        User::updateOrCreate(
            ['email' => 'admin@toko.com'],
            [
                'name' => 'Administrator Toko',
                'role' => 'admin',
                'password' => Hash::make('password'),
            ]
        );

        // Default Kasir User
        User::updateOrCreate(
            ['email' => 'kasir@toko.com'],
            [
                'name' => 'Kasir Operasional',
                'role' => 'kasir',
                'password' => Hash::make('password'),
            ]
        );
    }
}
