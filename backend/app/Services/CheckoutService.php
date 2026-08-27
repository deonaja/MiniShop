<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Create an order from a list of cart items inside a single transaction.
     *
     * Product rows are locked with `lockForUpdate` so concurrent checkouts cannot
     * oversell the same stock. Prices and names are snapshotted onto the order
     * items so later product edits do not rewrite historical orders.
     *
     * @param  array<int, array{product_id: int, qty: int}>  $items
     *
     * @throws ValidationException  when a product is missing or has insufficient stock
     */
    public function checkout(array $items): Order
    {
        // Merge duplicate product_ids so a product locked once covers the full qty.
        $quantities = [];
        foreach ($items as $item) {
            $id = (int) $item['product_id'];
            $quantities[$id] = ($quantities[$id] ?? 0) + (int) $item['qty'];
        }

        return DB::transaction(function () use ($quantities) {
            $products = Product::whereIn('id', array_keys($quantities))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $total = 0;
            $orderItems = [];

            foreach ($quantities as $productId => $qty) {
                $product = $products->get($productId);

                if ($product === null) {
                    throw ValidationException::withMessages([
                        'items' => "Product {$productId} is no longer available.",
                    ]);
                }

                if ($qty > $product->stock) {
                    throw ValidationException::withMessages([
                        'items' => "Not enough stock for \"{$product->name}\". Available: {$product->stock}, requested: {$qty}.",
                    ]);
                }

                $total += (float) $product->price * $qty;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->price,
                    'qty' => $qty,
                ];

                $product->decrement('stock', $qty);
            }

            $order = Order::create([
                'total' => $total,
                'status' => 'paid',
            ]);

            $order->items()->createMany($orderItems);

            return $order->load('items');
        });
    }
}
