package com.sikgu.sikgubackend.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {

    @NotNull(message = "플랜 ID는 필수 항목입니다.")
    private Long planId;

    @FutureOrPresent(message = "구독 시작일은 현재 시점 또는 미래여야 합니다.")
    private LocalDateTime startDate;


}
