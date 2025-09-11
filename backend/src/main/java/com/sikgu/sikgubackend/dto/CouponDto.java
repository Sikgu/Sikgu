package com.sikgu.sikgubackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CouponDto {
    private Long userId;
    private String couponCode;
}