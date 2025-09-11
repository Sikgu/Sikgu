package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.CouponDto;
import com.sikgu.sikgubackend.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/coupons")
@Tag(name = "쿠폰 및 결제", description = "쿠폰 및 결제 관련 API")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @Operation(summary = "쿠폰/프로모션 코드 적용", description = "결제에 쿠폰 코드를 적용합니다.")
    @PostMapping("/apply")
    public ResponseEntity<String> applyCoupon(@RequestBody CouponDto couponDto) {
        boolean success = couponService.applyCoupon(couponDto.getUserId(), couponDto.getCouponCode());
        if (success) {
            return ResponseEntity.ok("쿠폰이 성공적으로 적용되었습니다.");
        }
        return ResponseEntity.badRequest().body("쿠폰 적용에 실패했습니다.");
    }
}