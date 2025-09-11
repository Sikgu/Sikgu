package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.SubscriptionDto;
import com.sikgu.sikgubackend.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/subscription")
@Tag(name = "구독 및 결제", description = "구독 및 결제 관련 API")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Operation(summary = "구독 상태 확인", description = "사용자의 현재 구독 상태를 조회합니다.")
    @GetMapping("/status/{userId}")
    public ResponseEntity<String> getSubscriptionStatus(@PathVariable Long userId) {
        String status = subscriptionService.getSubscriptionStatus(userId);
        return ResponseEntity.ok(status);
    }

    @Operation(summary = "요금제 선택 및 변경", description = "사용자의 구독 요금제를 변경합니다.")
    @PutMapping("/plan/{userId}")
    public ResponseEntity<String> changePlan(@PathVariable Long userId, @RequestBody SubscriptionDto subscriptionDto) {
        boolean success = subscriptionService.changePlan(userId, subscriptionDto.getNewPlan());
        if (success) {
            return ResponseEntity.ok("요금제가 성공적으로 변경되었습니다.");
        }
        return ResponseEntity.badRequest().body("요금제 변경에 실패했습니다.");
    }
}