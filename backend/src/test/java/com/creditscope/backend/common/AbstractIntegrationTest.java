package com.creditscope.backend.common;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

// @spec DEPLOY-008
// @Transactional here wraps each test method in a rollback-only transaction (Spring
// Test's default), so writes made by one test (e.g. creating a company) never leak
// into the next test's assertions about seed-data counts.
@Transactional
// Singleton container pattern (intentionally no @Testcontainers/@Container lifecycle
// annotations): those tie start/stop to each test class's boundary, which stops the
// container after the first subclass finishes and leaves every later subclass pointed
// at a dead port. Starting it once in a static initializer and never stopping it (the
// Ryuk reaper cleans it up when the JVM exits) lets it be shared across all subclasses.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>(DockerImageName.parse("postgres:16"));

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    protected MockMvc mockMvc;

    // Sanity check that the Spring context boots against a real Testcontainers Postgres
    // with Flyway migrations applied — a useful first signal independent of any one endpoint.
    @Test
    void contextLoads() {
    }
}
