<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    /**
     * GET /api/products?search=&category=
     * Public catalog listing with optional search and category filter.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                // Portable case-insensitive match (works on PostgreSQL and SQLite).
                $term = '%'.mb_strtolower((string) $request->string('search')).'%';
                $query->where(function ($q) use ($term) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$term]);
                });
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * GET /api/products/{product} — public.
     */
    public function show(Product $product): ProductResource
    {
        return new ProductResource($product);
    }

    /**
     * POST /api/products — Sanctum protected.
     */
    public function store(StoreProductRequest $request): ProductResource
    {
        $product = Product::create($request->validated());

        return (new ProductResource($product))
            ->additional(['message' => 'Product created.']);
    }

    /**
     * PUT/PATCH /api/products/{product} — Sanctum protected.
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());

        return (new ProductResource($product))
            ->additional(['message' => 'Product updated.']);
    }

    /**
     * DELETE /api/products/{product} — Sanctum protected.
     */
    public function destroy(Product $product): Response
    {
        $product->delete();

        return response()->noContent();
    }
}
