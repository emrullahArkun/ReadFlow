package com.example.mybooktracker.auth.infra.bootstrap;

import com.example.mybooktracker.auth.domain.User;
import com.example.mybooktracker.auth.domain.Role;
import com.example.mybooktracker.auth.infra.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@example.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "AdminPassword123";

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DataInitializer dataInitializer;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dataInitializer, "defaultAdminEmail", DEFAULT_ADMIN_EMAIL);
        ReflectionTestUtils.setField(dataInitializer, "defaultAdminPassword", DEFAULT_ADMIN_PASSWORD);
    }

    @Test
    void initData_ShouldCreateAdminUser_WhenNotExists() throws Exception {
        when(userRepository.findByEmail(DEFAULT_ADMIN_EMAIL)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        CommandLineRunner runner = dataInitializer.initData();
        runner.run();

        verify(userRepository).save(any(User.class));
    }

    @Test
    void initData_ShouldSynchronizeAdminUser_WhenAlreadyExists() throws Exception {
        User existingAdmin = new User();
        existingAdmin.setId(1L);
        existingAdmin.setEmail(DEFAULT_ADMIN_EMAIL);
        existingAdmin.setPassword("oldPasswordHash");
        existingAdmin.setRole(Role.USER);
        existingAdmin.setEnabled(false);

        when(userRepository.findByEmail(DEFAULT_ADMIN_EMAIL)).thenReturn(Optional.of(existingAdmin));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        CommandLineRunner runner = dataInitializer.initData();
        runner.run();

        verify(userRepository).save(existingAdmin);
    }
}
