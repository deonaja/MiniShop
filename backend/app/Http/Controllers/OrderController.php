<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * GET /api/orders — Sanctum protected.
     */
    public function index(): AnonymousResourceCollection
    {
        $orders = Order::with('items')->latest()->paginate(15);

        return OrderResource::collection($orders);
    }

    /**
     * GET /api/orders/{order} — Sanctum protected.
     */
    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load('items'));
    }
}
