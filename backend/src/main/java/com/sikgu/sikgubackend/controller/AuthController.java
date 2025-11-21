package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.LoginRequest;
import com.sikgu.sikgubackend.dto.LoginResponse;
import com.sikgu.sikgubackend.dto.SignupRequest;
import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "회원가입")
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest signupRequest) {
        log.info("API CALL: POST /auth/signup - Attempting signup for email: {}", signupRequest.getEmail());

        if (authService.signup(signupRequest)) {
            log.info("SIGNUP SUCCESS: User {} successfully registered.", signupRequest.getEmail());
            return ResponseEntity.ok("회원가입이 성공적으로 완료되었습니다.");
        }
        log.warn("SIGNUP FAILED: Failed to register user with email: {}", signupRequest.getEmail());
        return ResponseEntity.badRequest().body("회원가입 실패.");
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("API CALL: POST /auth/login - Login attempt for email: {}", loginRequest.getEmail());

        // 인증 로직은 AuthService로 위임되었으므로 Controller는 단순 호출만 기록
        LoginResponse response = authService.login(loginRequest);

        log.info("LOGIN SUCCESS: Token generated for user: {}", loginRequest.getEmail());
        return ResponseEntity.ok().body(response);
    }

    @Operation(summary = "내 정보 조회 (JWT 기반)")
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        log.debug("API CALL: GET /auth/me - Authenticated access by email: {}", email);

        UserDto user = authService.getUserProfile(email);

        log.debug("USER INFO RETRIEVED: Profile data sent for user: {}", email);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "로그아웃(토큰 무효화)")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("API CALL: POST /auth/logout - Logout request received.");

        // 1. Bearer 접두사 체크 및 길이 확인
        if (authHeader == null || !authHeader.startsWith("Bearer ") || authHeader.length() <= 7) {
            // 잘못된 형식으로 요청이 들어왔을 경우 기록 (보안 WARN)
            log.warn("LOGOUT FAILED: Invalid Authorization header format or missing token.");
            return ResponseEntity.badRequest().build();
        }

        // 2. 안전하게 JWT 추출
        String jwt = authHeader.substring(7);

        // 3. 추출된 JWT가 비어있는지 체크
        if (jwt.trim().isEmpty()) {
            // 토큰이 비어있을 경우 기록
            log.warn("LOGOUT FAILED: Extracted JWT token is empty.");
            return ResponseEntity.badRequest().build();
        }

        // AuthService로 무효화 로직 위임 (성공 로그는 BlacklistService에서 처리)
        authService.logout(jwt);

        log.info("LOGOUT SUCCESS: Token sent for invalidation (JWT starts with {}).", jwt.substring(0, 10));
        return ResponseEntity.ok().build();
    }
}