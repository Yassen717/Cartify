# Impactful Fixes Plan (Backend / Runtime)

This plan targets the most impactful issues found during the project analysis (cache correctness, cart/wishlist correctness, product listing performance, and documentation accuracy).

## Order of execution

1. Track `docs/` in git (un-ignore)
2. Fix Redis cache key + invalidation mismatch
3. Fix wishlist `move-to-cart` to avoid duplicates
4. Remove N+1 queries in product listing (ratings)
5. Align README/docs with actual implementation (SQLite/libSQL, no Docker/CI present)

---

## 0) Track docs folder in git

### Change
- The repository root `.gitignore` currently ignored `docs/`, which blocks committing plans and project documentation.
- We changed it to ignore only `docs/local/`.

### Files
- `.gitignore`

### Git commit
```bash
git add .gitignore
git commit -m "chore(gitignore): track docs folder"
```

---

## 1) Fix cache invalidation (Redis)

### Problem
- `cacheMiddleware()` generates keys like:
  - `cache:${req.path}:${JSON.stringify(req.query)}:${JSON.stringify(req.params)}`
- `invalidateCache.*()` uses patterns like `cache:/api/products*`.
- These formats don’t consistently match, so cache entries are not reliably invalidated (stale reads after mutations).

### Goal
- Make cache keys deterministic and make invalidation patterns match them.
- Keep caching disabled cleanly when `REDIS_URL` is not set.

### Implementation
- Update `generateCacheKey()` to include a stable namespace prefix (e.g. `cache:v1:<path>:<sortedQuery>`).
- Update invalidation patterns to match the new namespace.
- Ensure product mutation endpoints call invalidation helpers appropriately (already done in `products.controller.ts`).

### Files
- `backend/src/middleware/cache.ts`

### Git commit
```bash
git add backend/src/middleware/cache.ts
git commit -m "fix(cache): align cache keys with invalidation"
```

---

## 2) Fix wishlist move-to-cart duplicates

### Problem
- `wishlist.controller.ts` `moveToCart` always creates a new `CartItem`.
- If the product already exists in cart, it creates duplicates instead of increasing quantity.

### Goal
- If an item already exists in cart, increment its quantity (like `cart.controller.ts addToCart`).
- Respect available stock.
- Keep the operation atomic via a Prisma transaction.

### Files
- `backend/src/controllers/wishlist.controller.ts`

### Git commit
```bash
git add backend/src/controllers/wishlist.controller.ts
git commit -m "fix(wishlist): avoid duplicate cart items when moving"
```

---

## 3) Remove N+1 in product listing rating aggregation

### Problem
- `GET /api/products` fetches a page of products, then runs `review.aggregate()` per product to compute average rating.
- This becomes expensive as the page size grows.

### Goal
- Compute ratings in a single query (or as few queries as possible) and attach to products.

### Implementation
- Use `prisma.review.groupBy({ by: ['productId'], _avg: { rating: true }, _count: { _all: true }, where: { productId: { in: [...] }}})`.
- Merge results into the products array.

### Files
- `backend/src/controllers/products.controller.ts`

### Git commit
```bash
git add backend/src/controllers/products.controller.ts
git commit -m "perf(products): avoid N+1 rating aggregation"
```

---

## 4) Align docs with actual implementation

### Problem
- Root `README.md` claims PostgreSQL and Docker/CI setup, but the repo currently uses SQLite/libSQL and lacks Docker/GitHub Actions files.

### Goal
- Ensure docs reflect what’s actually in the repo today, and optionally add a roadmap for Postgres/Docker if you still want them.

### Files
- `README.md`

### Git commit
```bash
git add README.md
git commit -m "docs: align README with actual implementation"
```

---

## Notes
- After each fix, run the app briefly (manual smoke test) before committing.
- If Redis is not configured, caching should remain a no-op (current behavior is good).
