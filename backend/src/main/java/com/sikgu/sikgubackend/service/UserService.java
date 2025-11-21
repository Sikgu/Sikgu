package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.InfoRequest;
import com.sikgu.sikgubackend.dto.SignupRequest;
import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.entity.enums.Role;
import com.sikgu.sikgubackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean signup(SignupRequest signupRequest) {
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            log.warn("SIGNUP FAILED: Email already exists: {}", signupRequest.getEmail());
            return false;
        }

        String email = signupRequest.getEmail();
        String password = passwordEncoder.encode(signupRequest.getPassword());

        User user = User.builder().email(email).password(password).role(Role.USER).build();

        try {
            userRepository.save(user);
            log.info("SIGNUP SUCCESS: New user registered: {}", signupRequest.getEmail());
            return true;
        } catch (Exception e) {
            log.error("SIGNUP ERROR: Database save failed for email: {}", signupRequest.getEmail(), e);
            return false;
        }
    }

    // 마이페이지에 표시할 사용자 정보를 조회하는 메소드
    public UserDto getUserProfile(String email) {
        log.debug("USER_READ: Attempting to fetch profile for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("USER_READ FAILED: User not found with email: {}", email);
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
                });

        log.debug("USER_READ SUCCESS: Profile retrieved for user ID: {}", user.getId());

        // User 엔티티를 확장된 UserDto로 변환하여 반환
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getAddress(),
                user.getPhoneNumber()
        );
    }

    // 주소 및 전화번호 변경
    @Transactional
    public UserDto updateInfo(String email, InfoRequest request) {
        log.info("USER_UPDATE: Attempting to update info for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("USER_UPDATE FAILED: Target user not found with email: {}", email);
                    return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
                });

        user.updateInfo(
                request.getAddress(),
                request.getPhoneNumber()
        );

        userRepository.save(user);

        log.info("USER_UPDATE SUCCESS: Info updated for user ID: {}", user.getId());

        return getUserProfile(email);
    }
}