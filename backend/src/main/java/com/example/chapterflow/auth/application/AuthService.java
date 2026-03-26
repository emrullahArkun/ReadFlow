package com.example.chapterflow.auth.application;

import com.example.chapterflow.auth.domain.Role;
import com.example.chapterflow.auth.domain.User;
import com.example.chapterflow.auth.infra.persistence.UserRepository;
import com.example.chapterflow.shared.exception.DuplicateResourceException;
import com.example.chapterflow.shared.exception.InvalidCredentialsException;
import com.example.chapterflow.shared.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode("invalid-user-placeholder");
    }

    @Transactional
    public User registerUser(String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already taken");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);

        // Always run BCrypt to prevent timing-based user enumeration
        String hashToCheck = user != null ? user.getPassword() : dummyHash;
        boolean passwordMatches = passwordEncoder.matches(password, hashToCheck);

        if (user == null || !passwordMatches) {
            log.warn("Failed login attempt for: {}", maskEmail(email));
            throw new InvalidCredentialsException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            log.warn("Login attempt for disabled account: {}", maskEmail(email));
            throw new InvalidCredentialsException("Invalid credentials");
        }

        log.info("Login successful for user ID: {}", user.getId());
        return user;
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***@***";
        String[] parts = email.split("@", 2);
        if (parts[0].length() <= 2) return parts[0] + "***@" + parts[1];
        return parts[0].substring(0, 2) + "***@" + parts[1];
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
