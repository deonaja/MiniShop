<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout)
    {
    }

    /**
     * POST /api/checkout — public.
     * Validates cart quantities against live stock and creates an order atomically.
     */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $order = $this->checkout->checkout($request->validated()['items']);

        return (new OrderResource($order))
            ->additional(['message' => 'Order placed successfully.'])
            ->response()
            ->setStatusCode(201);
    }
}
