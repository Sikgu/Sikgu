package com.sikgu.sikgubackend.dto.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

// HTTP 상태 코드는 Controller가 처리하므로, 여기서는 메시지만
@Getter
@RequiredArgsConstructor
public class ErrorDetailsDto {
    private final String code = "TRANSACTION_FAILED";
    private final String message;
}