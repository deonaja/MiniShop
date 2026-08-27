<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Wireless Headphones', 'price' => 89.90, 'category' => 'Electronics', 'stock' => 25, 'description' => 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.'],
            ['name' => 'Mechanical Keyboard', 'price' => 129.00, 'category' => 'Electronics', 'stock' => 15, 'description' => 'Hot-swappable RGB mechanical keyboard with tactile brown switches.'],
            ['name' => 'USB-C Hub 7-in-1', 'price' => 45.50, 'category' => 'Electronics', 'stock' => 40, 'description' => 'Aluminium USB-C hub with HDMI 4K, SD reader, and 100W power delivery.'],
            ['name' => 'Clean Code', 'price' => 32.00, 'category' => 'Books', 'stock' => 30, 'description' => 'A Handbook of Agile Software Craftsmanship by Robert C. Martin.'],
            ['name' => 'The Pragmatic Programmer', 'price' => 39.99, 'category' => 'Books', 'stock' => 20, 'description' => 'Your journey to mastery, 20th Anniversary Edition.'],
            ['name' => 'Cotton Crewneck T-Shirt', 'price' => 19.90, 'category' => 'Fashion', 'stock' => 60, 'description' => 'Soft 100% organic cotton t-shirt, unisex fit, available in classic black.'],
            ['name' => 'Canvas Sneakers', 'price' => 54.00, 'category' => 'Fashion', 'stock' => 18, 'description' => 'Low-top lace-up canvas sneakers with cushioned insole.'],
            ['name' => 'Ceramic Coffee Mug', 'price' => 14.50, 'category' => 'Home', 'stock' => 50, 'description' => 'Matte-glazed 350ml stoneware mug, microwave and dishwasher safe.'],
            ['name' => 'Scented Soy Candle', 'price' => 22.00, 'category' => 'Home', 'stock' => 0, 'description' => 'Hand-poured soy wax candle, sandalwood & vanilla, 45-hour burn time.'],
            ['name' => 'Wooden Building Blocks', 'price' => 27.75, 'category' => 'Toys', 'stock' => 12, 'description' => '50-piece natural beech wood block set for creative play, ages 3+.'],
        ];

        foreach ($products as $i => $data) {
            Product::create([
                ...$data,
                'image_url' => 'https://picsum.photos/seed/minishop'.($i + 1).'/400/400',
            ]);
        }
    }
}
