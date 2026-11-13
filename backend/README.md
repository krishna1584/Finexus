# Finexus backend

Spring Boot 2.7 microservices (Java 17). See the [main README](../README.md) for the architecture, security model and API.

## Run

1. Create a MySQL database, e.g. `CREATE DATABASE finexus;`
2. `cp .env.example .env`, then fill in MySQL details and a `JWT_SECRET`.
3. Windows: `start-services.bat` (stop with `stop-services.bat`).
   Elsewhere: export the variables in `.env`, then `mvn spring-boot:run` in `Service-Registry`, then `API-Gateway`, then the other services.
4. Check http://localhost:8761: every service should be registered.

## Environment variables

| Variable | Used by | Purpose |
| :--- | :--- | :--- |
| `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DB_NAME`, `MYSQL_USER`, `MYSQL_PASSWORD` | all services with data | Database connection |
| `JWT_SECRET` | User-Service, API-Gateway | Signs and checks login tokens. Base64, ≥ 32 bytes, **same value for both** |
| `CORS_ALLOWED_ORIGINS` | API-Gateway | Comma-separated browser origins (default `http://localhost:5173`) |

## Rules worth knowing before changing code

- **Only the gateway is public.** It verifies the JWT and sets `X-Auth-User-Id`; services use that header for ownership checks and skip them when it's absent (calls from other services). Never expose 8081–8085 directly.
- **Balances only change through** `POST /accounts/internal/adjust` and `POST /accounts/internal/transfer` in Account-Service. Each is a guarded, atomic SQL `UPDATE`, and a transfer runs in one DB transaction. Don't add endpoints that write a whole balance.
- **Internal endpoints** (`/accounts/internal/**`, `PUT`/`PATCH /accounts`, `/transactions/internal`, `/sequence/**`, `/api/users/ident/**`, `/api/users/accounts/**`, `PATCH /api/users/{id}`) are blocked in `API-Gateway/.../security/JwtAuthFilter.java`. Add new internal endpoints to that list.
- **CORS** is configured only in the gateway.

## Tests

```bash
mvn test
```

Unit tests (JUnit 5 + Mockito) cover the money rules (Account, Transaction, Fund-Transfer), the gateway's access rules, and sign-up and password validation. They need no database or running services.
