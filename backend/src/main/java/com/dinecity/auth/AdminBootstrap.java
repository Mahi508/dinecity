package com.dinecity.auth;

import com.dinecity.user.Role;
import com.dinecity.user.User;
import com.dinecity.user.UserRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the first administrator from configuration, because ADMIN accounts cannot be registered through the API.
 * Set DINECITY_ADMIN_EMAIL and DINECITY_ADMIN_PASSWORD before starting the backend.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrap(UserRepository users,
                          PasswordEncoder passwordEncoder,
                          @Value("${dinecity.admin.email:}") String adminEmail,
                          @Value("${dinecity.admin.password:}") String adminPassword) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }
        if (adminPassword.length() < 8) {
            log.warn("DINECITY_ADMIN_PASSWORD is shorter than 8 characters; admin account not created.");
            return;
        }
        String email = adminEmail.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) {
            return;
        }
        users.save(new User(email, passwordEncoder.encode(adminPassword), "Administrator", Role.ADMIN));
        log.info("Created administrator account {}", email);
    }
}
