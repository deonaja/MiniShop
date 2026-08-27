<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin account used to authenticate against the protected API endpoints.
        User::updateOrCreate(
            ['email' => 'admin@minishop.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ],
        );

        $this->call(ProductSeeder::class);
    }
}
