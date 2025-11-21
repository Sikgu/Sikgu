package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.PasswordResetToken;
import com.sikgu.sikgubackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUser(User user);
}