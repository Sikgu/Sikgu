package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.exception.InsufficientCoinException;
import com.sikgu.sikgubackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoinService {

    private final UserRepository userRepository;

    @Transactional
    public void addCoins(String email, long amount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("SUBSCRIPTION FAILED: User not found with email: {}", email);
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
                });

        if (amount <= 0) {
            log.warn("COIN ADDITION ATTEMPT: Attempted to add non-positive coin amount: {}", amount);
            return;
        }

        user.addCoins(amount);
        userRepository.save(user);
        log.info("COIN GAIN SUCCESS: User {} gained {} coins. New balance: {}", user.getEmail(), amount, user.getCoins());
    }

    @Transactional
    public void subtractCoins(String email, long amount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("COIN DEDUCTION FAILED: Target user not found with email: {}", email);
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
                });

        if (amount <= 0) {
            log.warn("COIN DEDUCTION ATTEMPT: Attempted to deduct non-positive coin amount: {}", amount);
            return;
        }

        if (user.getCoins() < amount) {
            log.warn("COIN DEDUCTION FAILED: User {} has insufficient coins (Current: {}, Required: {})",
                    user.getEmail(), user.getCoins(), amount);

            throw new InsufficientCoinException("코인이 부족합니다. 현재 잔액: " + user.getCoins());
        }

        user.subtractCoins(amount);
        userRepository.save(user);
        log.info("COIN DEDUCTION SUCCESS: User {} subtracted {} coins. New balance: {}", user.getEmail(), amount, user.getCoins());
    }
}