package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.LoginRequest;
import com.sikgu.sikgubackend.dto.LoginResponse;
import com.sikgu.sikgubackend.dto.SignupRequest;
import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.security.jwt.util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private final TokenBlacklistService blacklistService;

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
}