package com.shophub.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Builds the application DataSource.
 *
 * Local dev uses H2 in-memory. When deployed, Render provides a Postgres
 * connection string like postgres://user:pass@host:port/db via DB_URL.
 * That URL format is not a JDBC URL, so here we translate it.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    public DataSource dataSource(
            @Value("${DB_URL:jdbc:h2:mem:shophub;DB_CLOSE_DELAY=-1}") String dbUrl,
            @Value("${DB_USERNAME:sa}") String dbUsername,
            @Value("${DB_PASSWORD:}") String dbPassword,
            @Value("${DB_DRIVER:org.h2.Driver}") String dbDriver) {

        String jdbcUrl = dbUrl;
        String username = dbUsername;
        String password = dbPassword;
        String driver = dbDriver;

        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                URI uri = URI.create(dbUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    if (parts.length > 1) password = parts[1];
                }
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";
                jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath() + query;
                driver = "org.postgresql.Driver";
                log.info("Using Postgres database at {}", uri.getHost());
            } catch (Exception e) {
                log.error("Failed to parse Postgres connection string: {}", e.getMessage());
            }
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password != null ? password : "");
        ds.setDriverClassName(driver);
        ds.setMaximumPoolSize(5);
        ds.setPoolName("ShopHubPool");
        return ds;
    }
}