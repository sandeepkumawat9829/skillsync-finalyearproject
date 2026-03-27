package com.fyp.repository;

import com.fyp.model.entity.EmailVerificationToken;
import com.fyp.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByUserAndOtpCodeAndVerifiedFalse(User user, String otpCode);

    Optional<EmailVerificationToken> findTopByUserOrderByCreatedAtDesc(User user);

    void deleteByUser(User user);
}
