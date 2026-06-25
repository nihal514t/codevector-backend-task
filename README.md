# CodeVector Backend Take-Home Task

A backend service built using **Node.js**, **Express.js**, and **PostgreSQL** that allows browsing approximately **200,000 products** with efficient **cursor-based pagination**, category filtering, and consistent pagination while the dataset changes.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (Neon)
- node-postgres (pg)
- Render (Deployment)

---

## Features

- Cursor (Keyset) Pagination
- Category Filtering
- Fast Pagination using Composite Indexes
- Batch Seed Script for 200,000 Products
- Input Validation
- Invalid Cursor Handling
- Health Check Endpoint
- Snapshot-based Pagination Consistency

---

## Database Schema

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Indexes

```sql
CREATE INDEX idx_products_updated_id
ON products(updated_at DESC, id DESC);

CREATE INDEX idx_products_category_updated_id
ON products(category, updated_at DESC, id DESC);
```

These indexes optimize sorting and category-filtered pagination.

---

## API Endpoints

### Health Check

```
GET /health
```

Response

```json
{
  "status": "ok"
}
```

---

### Get Products

```
GET /products
```

Returns the newest products.

---

### Limit Results

```
GET /products?limit=10
```

---

### Filter by Category

```
GET /products?category=Books
```

---

### Cursor Pagination

```
GET /products?cursor=<nextCursor>
```

---

### Category + Cursor

```
GET /products?category=Books&cursor=<nextCursor>
```

---

## Sample Response

```json
{
  "products": [
    {
      "id": 194382,
      "name": "Product 194382",
      "category": "Books",
      "price": "599.00",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "nextCursor": "eyJ1cGRhdGVkX2F0Ijoi..."
}
```

---

## Cursor Pagination

This project uses **keyset (cursor) pagination** instead of offset pagination.

Cursor pagination provides:

- Better performance on large datasets
- No duplicate records while browsing
- Stable ordering using `(updated_at, id)`
- Efficient index usage

The cursor stores:

- updated_at
- id
- snapshot timestamp

This allows each browsing session to work against a consistent snapshot of the dataset.

---

## Seed Script

The repository includes a seed script that generates **200,000 products**.

Instead of inserting one row at a time, products are inserted in batches to reduce database round trips and improve performance.

Run:

```bash
npm run seed
```

---

## Local Setup

Clone the repository.

```bash
git clone <repository-url>
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
DATABASE_URL=your_neon_connection_string
PORT=3000
```

Run the seed script.

```bash
npm run seed
```

Start the server.

```bash
npm start
```

For development:

```bash
npm run dev
```

---

## Project Structure

```
codevector-task
│
├── database
│   └── schema.sql
│
├── seed
│   └── seed.js
│
├── src
│   ├── controllers
│   │   └── productController.js
│   │
│   ├── routes
│   │   └── productRoutes.js
│   │
│   ├── db.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

## Design Decisions

### Why PostgreSQL?

PostgreSQL provides efficient indexing, tuple comparisons, and excellent support for cursor-based pagination.

---

### Why Cursor Pagination?

Offset pagination becomes inefficient and can produce duplicate or skipped records when new data is inserted.

Cursor pagination solves this by using `(updated_at, id)` as the pagination key.

---

### Why Composite Indexes?

Composite indexes significantly improve query performance for:

- newest products
- category filtering
- cursor pagination

---

### Why Batch Inserts?

Generating 200,000 individual INSERT queries would be slow.

Batch inserts reduce the number of database round trips and greatly improve seeding performance.

---

## Improvements with More Time

- Add automated API tests
- Dockerize the application
- Add request logging
- Add rate limiting
- Add OpenAPI (Swagger) documentation
- Add caching for frequently requested categories

---

## AI Usage

AI was used to discuss the overall architecture, review implementation ideas, and validate the pagination strategy.

The implementation was tested, debugged, and verified manually to ensure correctness and understanding.
