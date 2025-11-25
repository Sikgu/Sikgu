package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.security.jwt.util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final Set<String> blacklist = Collections.synchronizedSet(new HashSet<>());
    private final JwtTokenUtil jwtTokenUtil;
    // 토큰 만료 후 블랙리스트에서 제거하는 작업을 위한 스케줄러
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public void blacklistToken(String token) {
        if (token == null) {
            log.warn("BLACKLIST WARNING: Attempted to blacklist a null token.");
            return;
        }

        if (isBlacklisted(token)) {
            log.warn("BLACKLIST WARNING: Token is already blacklisted (Starts with: {}).", token.substring(0, 10));
            return;
        }

        long remainingTimeSeconds = 0;
        try {
            remainingTimeSeconds = jwtTokenUtil.getRemainingTimeSeconds(token);
        } catch (Exception e) {
            log.error("BLACKLIST ERROR: Could not get remaining time for token (Starts with: {}). It might be malformed. Blacklisting for default 5 minutes.", token.substring(0, 10), e);
            // 만료 시간 계산 실패 시 임시로 5분(300초) 블랙리스트에 추가
            remainingTimeSeconds = 300;
        }

        if (remainingTimeSeconds > 0) {
            blacklist.add(token);
            log.info("LOGOUT BLACKLIST SUCCESS: Token added to blacklist (Starts with: {}). Expires in {} seconds.", token.substring(0, 10), remainingTimeSeconds);
            log.debug("Current blacklist size: {}", blacklist.size());
            scheduleRemoval(token, remainingTimeSeconds);
        } else {
            log.warn("LOGOUT BLACKLIST WARNING: Token already expired. No need to blacklist (Starts with: {}).", token.substring(0, 10));
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        log.debug("BLACKLIST CHECK: Checking if token (Starts with: {}) is blacklisted.", token.substring(0, 10));
        return blacklist.contains(token);
    }

    private void scheduleRemoval(String token, long delaySeconds) {
        scheduler.schedule(() -> {
            if (blacklist.remove(token)) {
                log.debug("BLACKLIST MAINTENANCE: Token successfully removed from blacklist after expiry (Starts with: {}).", token.substring(0, 10));
            } else {
                log.debug("BLACKLIST MAINTENANCE: Failed to remove token (Starts with: {}), possibly already removed.", token.substring(0, 10));
            }
        }, delaySeconds, TimeUnit.SECONDS);
        log.debug("BLACKLIST SCHEDULER: Removal scheduled for token (Starts with: {}) in {} seconds.", token.substring(0, 10), delaySeconds);
    }
}