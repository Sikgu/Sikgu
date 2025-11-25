package com.sikgu.sikgubackend.security.jwt.filter;

import com.sikgu.sikgubackend.security.jwt.util.JwtTokenUtil;
import com.sikgu.sikgubackend.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService blacklistService;

    public JwtAuthenticationFilter(
            JwtTokenUtil jwtTokenUtil,
            UserDetailsService userDetailsService,
            TokenBlacklistService blacklistService
    ) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
        this.blacklistService = blacklistService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. 로그인, 회원가입은 토큰 검사 X
        if (path.equals("/auth/login") || path.equals("/auth/signup")) {
            log.debug("FILTER SKIP: Skipping JWT processing for public path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String username = null;

        // Authorization: Bearer xxx
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);

            log.debug("JWT EXTRACTED: Token starts with {}.", jwt.substring(0, 10));

            // 2. 로그아웃된 토큰인지 확인 (블랙리스트 체크)
            if (blacklistService.isBlacklisted(jwt)) {
                log.warn("TOKEN BLOCKED: Blacklisted token rejected for path: {}", path);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // HTTP 401
                return;
            }

            try {
                username = jwtTokenUtil.extractUsername(jwt);
            } catch (Exception e) {
                // 토큰이 만료되었거나 서명이 유효하지 않을 경우
                log.warn("TOKEN REJECTED: Could not extract username (Token might be invalid or expired).", e);
                // SecurityContext에 인증 정보를 설정하지 않고 다음 필터로 넘김 (AuthorizationFilter가 401/403 처리)
            }
        } else {
            log.debug("AUTHORIZATION HEADER MISSING or format is incorrect. Path: {}", path);
        }

        // 3. username도 있고, SecurityContext에 인증정보 없으면 인증 시작
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            log.debug("AUTHENTICATION ATTEMPT: User details loaded for {}.", username);

            if (jwtTokenUtil.validateToken(jwt, userDetails.getUsername())) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("AUTHENTICATION SUCCESS: User {} successfully authenticated.", username);
            } else {
                log.warn("TOKEN VALIDATION FAILED for user: {}", username);
            }
        }

        filterChain.doFilter(request, response);
    }
}