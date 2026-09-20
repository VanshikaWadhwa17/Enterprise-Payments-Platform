# auth-service

Issues and validates identity for the Enterprise Payments Platform. Owns the `AppUser` table, hashes passwords with BCrypt, and issues a JWT (HS256, shared secret via `AUTH_JWT_SECRET`) delivered as an httpOnly `epp_token` cookie. `payment-service`, `fraud-service`, and `reconciliation-service` validate that same token as OAuth2 resource servers -- they never see a password, and `auth-service` never sees a business GraphQL request.

## Endpoints

- `POST /api/auth/signup` — `{ fullName, email, password, confirmPassword }`. Creates a `VIEWER` by default, sets the auth cookie.
- `POST /api/auth/login` — `{ email, password }`. Sets the auth cookie.
- `POST /api/auth/logout` — clears the auth cookie. Requires the `X-XSRF-TOKEN` header (CSRF-protected).
- `GET /api/auth/me` — returns the current user's profile + computed permissions. Requires the auth cookie.

`login` and `signup` are the only CSRF-exempt endpoints (no authenticated session exists yet to protect). Every other endpoint requires the `X-XSRF-TOKEN` header, read from the `XSRF-TOKEN` cookie this service also issues.

## Local dev demo users

Seeded by `DataSeeder` on first boot (only if the table is empty), one per role, all sharing the password `Passw0rd!`:

| Email             | Role               |
| ----------------- | ------------------ |
| alice@epp.dev      | PAYMENT_ANALYST    |
| bob@epp.dev        | OPERATIONS_MANAGER |
| carol@epp.dev      | ADMIN               |
| dan@epp.dev        | FRAUD_ANALYST      |
| erin@epp.dev       | VIEWER              |

## Env vars

See `.env.example` at the repo root: `AUTH_SERVICE_PORT`, `AUTH_JWT_SECRET` (also required by the 3 resource-server services, same value), `COOKIE_SECURE`, `CORS_ALLOWED_ORIGINS`.
