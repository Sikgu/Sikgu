package com.sikgu.sikgubackend.security.jwt.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtTokenUtil {

    private final Key key; // 서명에 사용할 Key 객체

    public JwtTokenUtil(@Value("${jwt.secret}") String secret) {
        // application.properties의 String secret을 사용해 서명 키 생성
        // Secret은 Base64 인코딩된 문자열이어야 합니다.
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        log.info("SECURITY INIT: JWT Signing Key initialized.");
    }

    public String generateToken(String email) {
        String token = Jwts.builder()
                .setSubject(email) // 토큰의 주체(subject)로 이메일 사용
                .setIssuedAt(new Date(System.currentTimeMillis())) // 발행 시간
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 유효 기간: 10시간
                .signWith(key, SignatureAlgorithm.HS256) // HS256 알고리즘으로 서명
                .compact();

        log.info("TOKEN GENERATED: New token created for user: {}", email);
        return token;
    }

    // ---------------------- Claim 추출 헬퍼 ----------------------
    private Claims extractAllClaims(String token) {
        // 초기화된 key 객체 사용
        return Jwts.parserBuilder()
                .setSigningKey(this.key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        // Claims 추출 로직은 DEBUG 레벨로 기록하여 파싱 오류 추적에 활용
        log.debug("CLAIM EXTRACTION: Attempting to extract claims from JWT (Starts with {}).", token.substring(0, 10));
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // ---------------------- 공개 메소드 ----------------------

    // 토큰에서 사용자 이름을 추출하는 메소드
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 토큰의 유효성을 검증하는 메소드
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        boolean isValid = extractedUsername.equals(username) && !isTokenExpired(token);

        if (!isValid) {
            log.warn("TOKEN VALIDATION FAILED: Token for {} is invalid (User match: {}, Expired: {}).", username, extractedUsername.equals(username), isTokenExpired(token));
        } else {
            log.debug("TOKEN VALIDATION SUCCESS: Token is valid for user {}.", username);
        }
        return isValid;
    }

    // 토큰 만료 여부를 확인하는 메소드
    private Boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    // 토큰에서 EXP(Expiration) 클레임을 추출합니다.
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 남은 유효 시간을 초 단위(Seconds)로 계산하는 메서드
    public long getRemainingTimeSeconds(String token) {
        Date expiration = extractExpiration(token);

        if (expiration.before(new Date())) {
            return 0;
        }

        long diffInMillis = expiration.getTime() - new Date().getTime();
        log.debug("TOKEN TIME: Remaining time for token is {} seconds.", TimeUnit.MILLISECONDS.toSeconds(diffInMillis));
        return TimeUnit.MILLISECONDS.toSeconds(diffInMillis);
    }
}