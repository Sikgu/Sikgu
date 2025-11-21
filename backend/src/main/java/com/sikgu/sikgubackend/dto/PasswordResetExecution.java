package com.sikgu.sikgubackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordResetExecution {
    private String token;
    private String newPassword;
}