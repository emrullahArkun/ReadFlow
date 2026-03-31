package com.example.mybooktracker.auth.infra.bootstrap;

import com.example.mybooktracker.auth.domain.Role;
import com.example.mybooktracker.auth.domain.User;
import com.example.mybooktracker.auth.infra.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.dev.admin.email}")
    private String defaultAdminEmail;

    @Value("${app.dev.admin.password}")
    private String defaultAdminPassword;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            String encodedPassword = passwordEncoder.encode(defaultAdminPassword);
            User admin = userRepository.findByEmail(defaultAdminEmail)
                    .orElseGet(User::new);

            boolean isNewAdmin = admin.getId() == null;
            admin.setEmail(defaultAdminEmail);
            admin.setPassword(encodedPassword);
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);

            userRepository.save(admin);

            if (isNewAdmin) {
                log.info("Default admin user created: {}", defaultAdminEmail);
            } else {
                log.info("Default admin user synchronized for dev profile: {}", defaultAdminEmail);
            }
        };
    }
}
