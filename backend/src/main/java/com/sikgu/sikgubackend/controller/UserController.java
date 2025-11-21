package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.InfoRequest;
import com.sikgu.sikgubackend.dto.UserDto;
import com.sikgu.sikgubackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
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
        String email = userDetails.getUsername();
        log.debug("API CALL: GET /users/mypage - Profile access requested by email: {}", email);

        UserDto userDto = userService.getUserProfile(email);

        log.info("USER READ SUCCESS: Fetched profile for user: {}", email);
        return ResponseEntity.ok(userDto);
    }

    @Operation(summary = "사용자 정보 변경")
    @PostMapping("/info")
    public ResponseEntity<UserDto> updateInfo(@AuthenticationPrincipal UserDetails userDetails, @RequestBody InfoRequest request) {
        String email = userDetails.getUsername();
        log.info("API CALL: POST /users/info - Update attempt by email: {}", email);

        UserDto updatedUser = userService.updateInfo(email, request);

        log.info("USER UPDATE SUCCESS: User information updated for email: {}", email);
        return ResponseEntity.ok(updatedUser);
    }
}