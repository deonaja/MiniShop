# AI Usage

## Tools

- **Claude Code** (Anthropic) — used as the primary development assistant to scaffold the backend and frontend, write the API, checkout logic, tests, and this documentation, and to run/verify the app end-to-end.

## How AI was used

- Generated the Laravel data model (migrations, models, factory, seeder), REST controllers, Form Requests, API Resources, and the transactional `CheckoutService`.
- Generated the React SPA (catalog, product detail, cart/checkout, admin login, product CRUD, orders) with Tailwind styling and a client-side cart Context.
- Wrote the PHPUnit feature tests and iterated until all passed.
- Verified the running stack: API smoke tests, the Vite→Laravel proxy, a real checkout (stock decrement + oversell rejection), and a rendered screenshot of the catalog.

All AI-generated code was reviewed and the app was verified to run before submission.

## Example crucial prompts

**1. Transactional checkout (the core correctness requirement)**

> "Implement checkout in Laravel as a service: wrap it in a DB transaction, lock the involved product rows with `lockForUpdate`, merge duplicate `product_id` lines before checking stock, reject with a 422 validation error if any quantity exceeds available stock, decrement stock, and create the order with snapshotted `product_name`/`price` on each order item so later product edits don't rewrite historical orders."

**2. Client-side cart with stock validation**

> "Build a React cart as a Context + useReducer persisted to localStorage. Cart lives entirely on the client and only becomes a DB order at checkout. Cap each line's quantity at the product's stock when adding or editing, expose totalItems/totalPrice, and on checkout POST `{items:[{product_id, qty}]}` to `/api/checkout`, showing the server's stock error message if it returns 422."
