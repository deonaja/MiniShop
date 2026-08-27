<?php

namespace Database\Seeders;

use App\Models\Product;
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

        // Only seed products on a fresh database so redeploys don't duplicate
        // rows or reset stock that live orders have already decremented.
        if (Product::count() === 0) {
            $this->call(ProductSeeder::class);
        }
    }
}
