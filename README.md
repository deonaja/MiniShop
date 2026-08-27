# MiniShop

A small full-stack e-commerce demo: browse a product catalog, manage a client-side cart, check out with atomic stock handling, and administer products/orders behind admin authentication.

## Tech Stack & Why

| Layer | Choice | Reason |
|---|---|---|
| Backend | **Laravel 11** (PHP 8.4) | Batteries-included REST API, Eloquent ORM, first-class DB transactions, Form Request validation. |
| Auth | **Laravel Sanctum** | Lightweight token auth — ideal for a SPA talking to an API without full OAuth overhead. |
| Database | **PostgreSQL 17** | Robust transactional RDBMS; row-level locking (`SELECT … FOR UPDATE`) makes safe checkout straightforward. |
| Frontend | **React 19 + Vite** | Fast dev server/HMR, component model fits a catalog/cart UI. |
| Styling | **Tailwind CSS v4** | Rapid, consistent styling without a separate CSS architecture. |
| HTTP | **axios** + **react-router-dom** | Simple client with token interceptor; standard SPA routing. |

**Architecture notes**
- Cart is **client-side** (React Context + `localStorage`); it only becomes a DB order at checkout.
- Checkout is **transactional**: product rows are locked with `lockForUpdate`, stock is validated and decremented, and the order + snapshotted line items are created atomically. Concurrent checkouts cannot oversell.
- Order items **snapshot** `product_name` and `price` so later product edits never rewrite historical orders.
- Thin controllers → validation via **Form Requests**, serialization via **API Resources**, checkout logic in a dedicated **service**.

## Project Structure

```
backend/    Laravel 11 API (models, controllers, services, migrations, tests)
frontend/   React + Vite SPA (pages, context, components)
```

## Prerequisites

- PHP 8.4 + Composer
- Node.js 20+ / npm
- PostgreSQL 17 (database `minishop`, user `postgres` / password `postgres123`, port 5432)

## Setup

```bash
# Backend
cd backend
cp .env.example .env          # then set the DB_* block (see below)
composer install
php artisan key:generate
php artisan migrate --seed
```

`.env` database block:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=minishop
DB_USERNAME=postgres
DB_PASSWORD=postgres123
```

```bash
# Frontend
cd frontend
npm install
```

## Run

```bash
# Terminal 1 — backend API
cd backend
php artisan serve            # http://127.0.0.1:8000

# Terminal 2 — frontend SPA
cd frontend
npm run dev                  # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed in development. For production, set `VITE_API_URL` to the deployed backend's `/api` base.

**Seeded admin:** `admin@minishop.test` / `password`

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/login` | public | Authenticate admin, returns a Sanctum token |
| POST | `/api/logout` | 🔒 Sanctum | Revoke current token |
| GET | `/api/me` | 🔒 Sanctum | Current admin |
| GET | `/api/products?search=&category=` | public | List products (search + category filter, paginated) |
| GET | `/api/products/{id}` | public | Product detail |
| POST | `/api/products` | 🔒 Sanctum | Create product |
| PUT/PATCH | `/api/products/{id}` | 🔒 Sanctum | Update product |
| DELETE | `/api/products/{id}` | 🔒 Sanctum | Delete product |
| POST | `/api/checkout` | public | Place an order (validates stock, decrements atomically) |
| GET | `/api/orders` | 🔒 Sanctum | List orders |
| GET | `/api/orders/{id}` | 🔒 Sanctum | Order detail with line items |

### Checkout request shape

```json
{ "items": [ { "product_id": 1, "qty": 2 }, { "product_id": 4, "qty": 1 } ] }
```

Returns `201` with the created order, or `422` with a message if any line exceeds available stock.

## Tests

```bash
cd backend
php artisan test
```

Covers cart total calculation, stock decrement, oversell rejection (including merged duplicate lines), auth, and product CRUD — **13 tests**. Tests run against an in-memory SQLite database; the search query uses portable `LOWER(...) LIKE` so it behaves identically on PostgreSQL and SQLite.

## Known Limitations

- Single shared admin account; no user registration or role management.
- No payment gateway — checkout marks orders `paid` immediately (out of scope).
- Admin product list shows the first page (12 items); pagination UI is not wired for large catalogs.
- Cart stock hints come from the moment items were added; the server remains the source of truth and rejects stale over-orders at checkout.
- No image upload — products reference an external `image_url`.
- Sanctum token is stored in `localStorage` for simplicity (acceptable for this demo; a production build would prefer httpOnly cookies).
