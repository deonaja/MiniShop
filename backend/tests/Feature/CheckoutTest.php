<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_calculates_total_and_decrements_stock(): void
    {
        $a = Product::factory()->create(['price' => 10.00, 'stock' => 5]);
        $b = Product::factory()->create(['price' => 2.50, 'stock' => 10]);

        $response = $this->postJson('/api/checkout', [
            'items' => [
                ['product_id' => $a->id, 'qty' => 2], // 20.00
                ['product_id' => $b->id, 'qty' => 4], // 10.00
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.total', fn ($total) => (float) $total === 30.0)
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonCount(2, 'data.items');

        // Stock decremented atomically.
        $this->assertSame(3, $a->fresh()->stock);
        $this->assertSame(6, $b->fresh()->stock);

        // Order + snapshot items persisted.
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $a->id,
            'product_name' => $a->name,
            'qty' => 2,
        ]);
    }

    public function test_checkout_rejects_quantity_greater_than_stock(): void
    {
        $product = Product::factory()->create(['stock' => 3]);

        $response = $this->postJson('/api/checkout', [
            'items' => [
                ['product_id' => $product->id, 'qty' => 5],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrorFor('items');

        // Nothing changed: stock intact, no order created.
        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_merges_duplicate_product_lines_against_stock(): void
    {
        $product = Product::factory()->create(['price' => 5.00, 'stock' => 4]);

        // 3 + 3 = 6 > 4 available, even though each line alone is <= stock.
        $response = $this->postJson('/api/checkout', [
            'items' => [
                ['product_id' => $product->id, 'qty' => 3],
                ['product_id' => $product->id, 'qty' => 3],
            ],
        ]);

        $response->assertStatus(422);
        $this->assertSame(4, $product->fresh()->stock);
    }

    public function test_checkout_requires_at_least_one_item(): void
    {
        $this->postJson('/api/checkout', ['items' => []])
            ->assertStatus(422)
            ->assertJsonValidationErrorFor('items');
    }
}
