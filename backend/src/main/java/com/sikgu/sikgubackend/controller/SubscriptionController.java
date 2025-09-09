package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.SubscriptionDto;
import com.sikgu.sikgubackend.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PutMapping("/plan/{userId}")
    public ResponseEntity<String> changePlan(@PathVariable Long userId, @RequestParam String newPlan) {
        if (subscriptionService.changePlan(userId, newPlan)) {
            return ResponseEntity.ok("요금제가 성공적으로 변경되었습니다.");
        }
        return ResponseEntity.badRequest().body("요금제 변경 실패.");
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<SubscriptionDto> getStatus(@PathVariable Long userId) {
        SubscriptionDto status = subscriptionService.getSubscriptionStatus(userId);
        return ResponseEntity.ok(status);
    }
}