package com.sikgu.sikgubackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubscriptionDto {
    private String status;
    private String plan;
}