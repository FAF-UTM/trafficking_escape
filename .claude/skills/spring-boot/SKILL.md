---
name: spring-boot
description: Spring Boot 4.1 backend architecture (controllers/services/repos/record DTOs, Spring Security resource-server JWT, JPA/Postgres, Flyway, OpenAI Responses API, springdoc). Use when adding endpoints, entities, migrations, security rules, AI prompts or config in backend/ (and service-checker/, Boot 2.3).
---

# Spring Boot backend

Versions: `backend` = Spring Boot **4.1** on Java 21 (Jakarta EE, `jakarta.*`; Jackson 3 = `tools.jackson.*`, annotations still `com.fasterxml.jackson.annotation`). `service-checker` = Spring Boot **2.3** (`javax.*` imports) — don't mix them up.

## Package layout (`backend/src/main/java/org/example/backend`)
`controllers/` → `services/` → `repos/` (Spring Data JPA) → `model/` (entities).
`dto/` for request/response **records** (with `static from(entity)` mappers — no MapStruct), `security/` (JWT, rate limiter), `exceptions/` (ProblemDetail handler), `ai/` (OpenAI client + prompt), `config/`.

## Adding an endpoint
1. Request + response records in `dto/` with Bean Validation (`@NotBlank`, `@Size`, …). Never expose entities and never map request ids onto entities (mass-assignment).
2. Repository method in `repos/` (derived query or `@Query`; projections like `SessionStatsProjection` for aggregates).
3. Business logic + `@Transactional` in a `services/` class; enforce ownership with `findByIdAndUserId` (see `ChatService.getOwnedChat`, returns 404 for other users' data). Throw `NotFoundException`/`ConflictException`; `ApiExceptionHandler` maps them.
4. Controller in `controllers/`:
   - `@RestController`, `@RequestMapping("/api/...")`.
   - `@Valid @RequestBody`. Authorization with `@PreAuthorize("hasAnyRole('USER', 'ADMIN')")` or `hasRole('ADMIN')` (no `ROLE_` prefix inside hasRole).
   - Public endpoints that can be abused: `rateLimiter.check(RateLimiter.Limit.X, key)`.
   - Current user via `@AuthenticationPrincipal PlatformUserDetails principal`.
   - Return the record directly; `ResponseEntity` only for 204/headers.
5. If the path must be public or needs CORS changes, update `security/SecurityConfig.java`.
6. Update the frontend caller in `client/` (see the `react` skill).

## Database
- Postgres via `SPRING_DATASOURCE_*` env vars; schema is owned by **Flyway** (`src/main/resources/db/migration`).
- Every entity/column change needs a new migration — never edit an applied one. Existing naming: `V<timestamp-or-number>__camelCaseDescription.sql`; use the next number higher than the latest (`V$(date +%s%3N)__description.sql` matches the newest files).
- Don't rely on `ddl-auto` to create schema.

## Security
- Sessions: `security/JwtService` issues HS256 JWTs that live **only** in the HttpOnly/Secure/SameSite=Strict cookie `te_session` (`AuthCookies`); responses never contain the token. Sign-in endpoints return `SessionResponse` + `Set-Cookie`; `/api/v1/auth/{session,csrf,logout}` serve the SPA. Secret from `JWT_SECRET` (≥32 chars).
- Verification: `CookieBearerTokenResolver` + a manually registered `BearerTokenAuthenticationFilter`. Do **not** switch to `oauth2ResourceServer()` — it exempts token-bearing requests from CSRF, which is unsafe with cookies (covered by `stateChangingRequestsWithoutCsrfTokenAreRejected`).
- CSRF: double-submit (`te_csrf` HttpOnly cookie + `X-XSRF-TOKEN` header from `GET /api/v1/auth/csrf`). Only `POST /api/v1/gameplay` (beacon) is exempt. In tests use the real-token helpers in `ApiIntegrationTest`, not Spring's `csrf()` post-processor (it disables real CSRF checks for the whole context).
- Registration is admin-only; first admin via `ADMIN_USERNAME`/`ADMIN_PASSWORD` (`AdminBootstrap`).
- `PasswordEncoder` is delegating (`{bcrypt}` prefix) and still accepts legacy un-prefixed BCrypt hashes.
- Don't log tokens or passwords; hash passwords with the configured `PasswordEncoder`.

## Config
- `application.properties` reads secrets from env (`OPENAI_API_KEY`/`GPT_TOKEN`, `JWT_SECRET`, DB creds); see root `.env.example`. Typed settings live in `@ConfigurationProperties` records. Prod profile `prod` disables Swagger.
- AI: `ai/OpenAiResponsesClient` calls `POST /v1/responses` with strict `json_schema` output; model from `OPENAI_MODEL` (default `gpt-6-luna`). The prompt lives in `src/main/resources/prompts/chat-turn-instructions.md` — edit it there, keep the hard content limits.
- Actuator exposes `health,info` (used by Docker healthchecks and service-checker).
- Swagger UI (springdoc): `http://localhost:8080/swagger-ui/index.html` — annotate new endpoints clearly.

## Verify
```bash
cd backend && mvn -q compile && mvn test   # integration tests use Testcontainers (postgres:12), Docker must run
```
If `backend/target` is root-owned (created by the compose container), build a copy elsewhere or `sudo rm -rf backend/target`.
Then hit the endpoint (Swagger or curl with `Authorization: Bearer <jwt>`).
