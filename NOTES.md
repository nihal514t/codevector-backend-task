# NOTES.md

## Technology Choices

### Backend

I chose **Node.js** with **Express.js** because I am most comfortable with the Node.js ecosystem and it allowed me to focus on solving the pagination and database problems rather than learning a new framework.

### Database

I chose **PostgreSQL** (hosted on Neon) because it provides:

* Efficient indexing
* Composite indexes
* Tuple comparison support
* Excellent performance for cursor-based pagination
* Strong consistency guarantees

These features make PostgreSQL well suited for handling large datasets efficiently.

---

## Pagination Strategy

Instead of using offset pagination, I implemented **cursor (keyset) pagination** based on:

* `updated_at`
* `id`

The products are ordered by:

```sql
ORDER BY updated_at DESC, id DESC
```

The cursor contains:

* `updated_at`
* `id`
* `snapshot`

Using `(updated_at, id)` provides deterministic ordering even when multiple products share the same timestamp.

---

## Handling Data Changes

To provide a consistent browsing experience while data changes, I introduced a **snapshot timestamp**.

When the first page is requested, a snapshot timestamp is generated and included in the cursor. Every subsequent request uses the same snapshot to ensure the user continues browsing the same logical view of the dataset.

This prevents newly inserted or newly updated products from appearing unexpectedly during an active browsing session.

---

## Database Indexes

To optimize query performance, I created two composite indexes.

```sql
(updated_at DESC, id DESC)
```

Used for fast cursor pagination.

```sql
(category, updated_at DESC, id DESC)
```

Used for efficient category filtering while maintaining the same ordering.

---

## Product Generation

The assignment required generating approximately 200,000 products.

Instead of inserting one product at a time, the seed script inserts products in batches. This significantly reduces database round trips and improves seeding performance.

---

## API Features

The backend provides:

* Cursor-based pagination
* Category filtering
* Configurable page size
* Snapshot-based consistency
* Invalid cursor validation
* Health check endpoint

---

## What I Would Improve With More Time

If I had additional time, I would:

* Add automated API tests using Jest and Supertest.
* Add Docker support for easier deployment.
* Add API documentation using OpenAPI (Swagger).
* Add structured request logging.
* Add rate limiting and security middleware.
* Add performance benchmarks for pagination queries.
* Add monitoring and metrics.

---

## AI Usage

I used AI as a development assistant to discuss architecture, review different pagination approaches, and validate implementation ideas.

I implemented, tested, and debugged the backend myself, including:

* Database schema
* Seed script
* Query logic
* Cursor pagination
* Snapshot consistency
* API testing

I also verified the final implementation by testing pagination, filtering, validation, and error handling locally before deployment.
