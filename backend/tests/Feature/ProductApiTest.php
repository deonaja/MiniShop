<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_list_is_public(): void
    {
        Product::factory()->count(3)->create();

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_products_can_be_filtered_by_search_and_category(): void
    {
        Product::factory()->create(['name' => 'Blue Widget', 'category' => 'Gadgets']);
        Product::factory()->create(['name' => 'Red Gizmo', 'category' => 'Gadgets']);
        Product::factory()->create(['name' => 'Blue Notebook', 'category' => 'Stationery']);

        // Case-insensitive search.
        $this->getJson('/api/products?search=blue')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/products?category=Stationery')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_creating_a_product_requires_authentication(): void
    {
        $this->postJson('/api/products', [])
            ->assertUnauthorized();
    }

    public function test_authenticated_admin_can_create_a_product(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/products', [
            'name' => 'New Product',
            'price' => 99.99,
            'category' => 'Electronics',
            'stock' => 7,
        ])->assertCreated()
            ->assertJsonPath('data.name', 'New Product');

        $this->assertDatabaseHas('products', ['name' => 'New Product', 'stock' => 7]);
    }

    public function test_authenticated_admin_can_delete_a_product(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create();

        $this->deleteJson("/api/products/{$product->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
