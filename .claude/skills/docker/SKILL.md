---
name: docker
description: How this repo runs in Docker (docker-compose with nginx, backend, Postgres, service-checker) and how to edit Dockerfiles/compose safely. Use when touching docker-compose.yml, any Dockerfile, nginx/ config, or when starting/debugging the stack.
---

# Docker / Compose

## Services (`docker-compose.yml`, network `app_network`)
| Service | Image | Ports | Notes |
|---|---|---|---|
| `nginx` | nginx:latest | 80, 443 | config `nginx/conf.d`, certs `nginx/certs` (read-only mounts) |
| `backend` | maven:3.9.16-eclipse-temurin-21 | 8080, 5005 (JDWP) | mounts `./backend`, runs `mvn spring-boot:run` with remote debug; needs `OPENAI_API_KEY` + `JWT_SECRET` from `.env` |
| `db` | postgres:12 | 5432 | volume `postgres_data` |
| `service-checker` | maven:3.6.3-jdk-11 | 18080→8080, 15080→5005 | polls `backend:8080/actuator/health` and `db:5432` |

The compose file is a **dev** setup (source mounted, compiled in-container). The `Dockerfile`s in `backend/` and `service-checker/` are **prod** images that expect a pre-built `*.jar` in the build context and run with `-Dspring.profiles.active=prod`.

## Common commands
```bash
docker compose up -d db backend          # start dev stack pieces
docker compose logs -f backend
docker compose restart backend           # recompile + restart after Java changes
docker compose exec db psql -U alex postgres
docker compose down                      # keep volumes; add -v ONLY if user asks to wipe the DB
```
Prod image build: `cd backend && mvn -DskipTests package && cp target/*.jar . && docker build -t backend .`

## Rules
- Never commit secrets. Credentials live in the git-ignored root `.env` (template: `.env.example`) and are referenced as `${VAR}` in compose.
- Containers talk to each other by service name (`db`, `backend`), not `localhost`.
- Pin image tags (avoid `latest` for new services); keep the Java version consistent with the module's `pom.xml` (backend 21, service-checker 11).
- Backend prod image: `eclipse-temurin:21-jre-alpine`, non-root user, `prod` profile.
- Postgres 12 is EOL and below Hibernate 7's supported minimum (14). Upgrading needs a dump/restore of the `postgres_data` volume — never just bump the image tag.
- Healthchecks use `/actuator/health`; the service must include `spring-boot-starter-actuator` for that to work.
- Ask before `docker compose down -v`, `docker volume rm`, or `docker system prune` — they delete DB data.
