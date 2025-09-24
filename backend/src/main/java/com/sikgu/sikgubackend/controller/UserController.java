package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "마이페이지 사용자 정보 조회")
    @GetMapping("/mypage")
    public ResponseEntity<UserDto> getMyPage(@AuthenticationPrincipal UserDetails userDetails) {
        // @AuthenticationPrincipal을 사용해 현재 로그인한 사용자 정보를 가져옵니다.
        String email = userDetails.getUsername();

        // 사용자 정보를 조회하여 DTO로 변환
        UserDto userDto = userService.getUserProfile(email);

        return ResponseEntity.ok(userDto);
    }
}