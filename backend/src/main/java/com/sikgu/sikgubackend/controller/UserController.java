package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserDto userDto) {
        if (userService.signup(userDto)) {
            return ResponseEntity.ok("회원가입이 성공적으로 완료되었습니다.");
        }
        return ResponseEntity.badRequest().body("회원가입 실패.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserDto userDto) {
        if (userService.login(userDto.getEmail(), userDto.getPassword())) {
            return ResponseEntity.ok("로그인 성공.");
        }
        return ResponseEntity.badRequest().body("로그인 실패. 이메일 또는 비밀번호를 확인해주세요.");
    }

    @PostMapping("/find-account")
    public ResponseEntity<String> findAccount(@RequestBody UserDto userDto) {
        String result = userService.findAccount(userDto.getEmail());
        return ResponseEntity.ok(result);
    }
}