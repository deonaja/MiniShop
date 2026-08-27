<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'price' => fake()->randomFloat(2, 5, 500),
            'description' => fake()->sentence(12),
            'image_url' => 'https://picsum.photos/seed/'.fake()->unique()->numberBetween(1, 100000).'/400/400',
            'category' => fake()->randomElement(['Electronics', 'Books', 'Fashion', 'Home', 'Toys']),
            'stock' => fake()->numberBetween(0, 50),
        ];
    }

    /**
     * Product that is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => ['stock' => 0]);
    }
}
