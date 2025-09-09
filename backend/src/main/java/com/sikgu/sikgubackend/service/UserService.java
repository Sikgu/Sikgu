package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean signup(UserDto userDto) {
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        user.setNickname(userDto.getNickname());

        try {
            userRepository.save(user);
            System.out.println("회원가입 처리 완료: " + userDto.getEmail());
            return true;
        } catch (Exception e) {
            System.err.println("회원가입 중 오류 발생: " + e.getMessage());
            return false;
        }
    }

    public boolean login(String email, String password) {
        System.out.println("로그인 시도: " + email);
        return true;
    }

    public String findAccount(String email) {
        System.out.println("계정 찾기 요청: " + email);
        return "인증 이메일을 보냈습니다.";
    }
}