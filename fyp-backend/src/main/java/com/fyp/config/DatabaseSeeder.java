package com.fyp.config;

import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        var admins = userRepository.findByRole(Role.ADMIN);
        if (admins.isEmpty()) {
            // Create default admin
            User defaultAdmin = User.builder()
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .emailVerified(true)
                    .profileCompleted(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(defaultAdmin);
            System.out.println("Default admin user created: admin@example.com / admin123");
        } else {
            // Fix existing admin users that may have stale flags
            for (User admin : admins) {
                boolean changed = false;
                if (!Boolean.TRUE.equals(admin.getEmailVerified())) {
                    admin.setEmailVerified(true);
                    changed = true;
                }
                if (!Boolean.TRUE.equals(admin.getProfileCompleted())) {
                    admin.setProfileCompleted(true);
                    changed = true;
                }
                if (changed) {
                    userRepository.save(admin);
                    System.out.println("Fixed admin flags for: " + admin.getEmail());
                }
            }
        }
    }
}
