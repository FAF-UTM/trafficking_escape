---
name: java
description: Java code style and build conventions for backend/ (Java 21) and service-checker/ (Java 11) Maven modules. Use when writing or refactoring any .java file, pom.xml, or running Maven builds/tests.
---

# Java

## Modules
- `backend/` – Java **21**, Maven, package `org.example.backend`.
- `service-checker/` – Java **11**, Maven, package `org.example.service`. Don't use Java 12+ features here (no records, switch expressions, text blocks, `var` in lambdas is fine).

## Style (match existing code)
- 4-space indent, braces on the same line, one top-level class per file.
- Constructor injection with `private final` fields (no field `@Autowired`).
- Lombok is available; entities use `@Getter`/`@Setter`. Prefer that over `@Data` on JPA entities (avoids equals/hashCode issues with lazy relations).
- Java 21 code in backend may use records (good for DTOs/projections), `var`, switch expressions, text blocks, pattern-matching `instanceof`.
- Use `Optional` for repository lookups; throw a meaningful exception instead of returning `null`.
- Use `java.time` (`Instant`, `LocalDateTime`), never `java.util.Date`.
- Log with SLF4J (`LoggerFactory.getLogger` or Lombok `@Slf4j`), not `System.out`.
- No secrets in source; read config via `@Value("${...}")` or `@ConfigurationProperties`.

## Build & test
```bash
cd backend && mvn -q compile          # fast check
cd backend && mvn test                # unit/integration tests (src/test/java/org/example/backend)
cd backend && mvn -DskipTests package # jar in target/
```
Same commands in `service-checker/` (has JaCoCo; `mvn verify` produces coverage).
If no local JDK/Maven, run inside the compose container: `docker compose exec backend mvn -q compile`.

Tests: JUnit + Spring Boot Test + Testcontainers (`ApiIntegrationTest`, `@MockitoBean` for the OpenAI client) (`spring-boot-starter-test`, includes Mockito/AssertJ). Name tests `<ClassUnderTest>Test`, prefer plain unit tests with Mockito over `@SpringBootTest` when no Spring context is needed.
