package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.request.LoginRequest;
import com.sikgu.sikgubackend.dto.response.LoginResponse;
import com.sikgu.sikgubackend.dto.request.SignupRequest;
import com.sikgu.sikgubackend.dto.response.UserDto;
import com.sikgu.sikgubackend.entity.PasswordResetToken;
import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.repository.PasswordResetTokenRepository;
import com.sikgu.sikgubackend.repository.UserRepository;
import com.sikgu.sikgubackend.security.jwt.util.JwtTokenUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private final TokenBlacklistService blacklistService;

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int EXPIRATION_MINUTES = 30;

    public LoginResponse login(LoginRequest loginRequest) {
        log.debug("SERVICE: Starting login process for email: {}", loginRequest.getEmail());

        // 1) 인증 객체 생성 및 인증 관리자 호출 (인증 시도)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        log.info("LOGIN FLOW: Authentication successful for user: {}", loginRequest.getEmail());

        // 2) 인증 성공 후 Context에 저장
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3) 토큰 생성
        String token = jwtTokenUtil.generateToken(authentication.getName());
        log.debug("TOKEN GENERATION: JWT created successfully.");

        // 4) 응답 DTO 반환
        return new LoginResponse(token);
    }

    public boolean signup(SignupRequest signupRequest) {
        log.debug("SERVICE: Delegating signup request for email: {}", signupRequest.getEmail());
        return userService.signup(signupRequest);
    }

    public UserDto getUserProfile(String email) {
        log.debug("SERVICE: Retrieving user profile for email: {}", email);
        return userService.getUserProfile(email);
    }

    public void logout(String jwt) {
        log.info("LOGOUT FLOW: Initiating token blacklisting for JWT (Starts with: {}).", jwt.substring(0, 10));

        // 토큰을 블랙리스트에 등록
        blacklistService.blacklistToken(jwt);
    }

    @Transactional
    public void generateResetTokenAndSendEmail(String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            // 기존 토큰 삭제 (새 토큰만 유효)
            tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);

            PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
            tokenRepository.save(resetToken);

            String resetUrl = frontendBaseUrl + "/reset-page?token=" + token; // 프론트엔드 URL

            try {
                emailService.sendResetPasswordEmail(user.getEmail(), resetUrl);
                log.info("PASSWORD RESET FLOW: Reset email successfully scheduled for user: {}", user.getEmail());
            } catch (Exception e) {
                // SMTP 서버 오류나 JavaMail 문제 등 외부 시스템 오류
                // 토큰은 이미 DB에 저장되었으므로, 보안상의 이유로 여기서 예외를 다시 던지지 않고 로그만 남깁니다.
                log.error("EMAIL FAILURE: Failed to send reset email to {}. Link was: {}", user.getEmail(), resetUrl, e);
            }
            log.info("PASSWORD RESET FLOW: Token generated and email sent to: {}", email);

        }
        else {
            // 보안상의 이유로 (Email Enumeration Attack 방지), 사용자가 없어도 성공 응답 처리
            log.warn("PASSWORD RESET FLOW: Received request for non-existent email: {}. Processed silently.", email);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword, String passwordConfirm) {
        // 비밀번호 확인 검증
        if (!newPassword.equals(passwordConfirm)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("PASSWORD RESET FAILED: Invalid token provided.");
                    return new IllegalArgumentException("유효하지 않은 토큰입니다.");
                });

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken); // 만료된 토큰 정리
            log.warn("PASSWORD RESET FAILED: Token expired for user: {}", resetToken.getUser().getEmail());
            throw new IllegalArgumentException("토큰이 만료되었습니다. 재설정 요청을 다시 해주세요.");
        }

        // 비밀번호 업데이트
        User user = resetToken.getUser();

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 사용 완료된 토큰 삭제
        tokenRepository.delete(resetToken);
        log.info("PASSWORD RESET SUCCESS: Password updated for user: {}", user.getEmail());
    }
}