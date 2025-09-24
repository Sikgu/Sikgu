package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.SignupRequest;
import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.entity.enums.Role;
import com.sikgu.sikgubackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
            System.err.println("회원가입 실패: 이미 존재하는 이메일입니다.");
            return false;
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setNickName(signupRequest.getNickName());
        user.setRole(Role.USER);

        try {
            userRepository.save(user);
            System.out.println("회원가입 처리 완료: " + signupRequest.getEmail());
            return true;
        } catch (Exception e) {
            System.err.println("회원가입 중 오류 발생: " + e.getMessage());
            return false;
        }
    }

    // 마이페이지에 표시할 사용자 정보를 조회하는 메소드
    public UserDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        // User 엔티티를 UserDto로 변환하여 반환
        return new UserDto(user.getNickName(), user.getEmail());
    }
}