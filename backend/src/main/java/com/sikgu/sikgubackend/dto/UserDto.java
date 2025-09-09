package com.sikgu.sikgubackend.dto;

import lombok.Data;

@Data
public class UserDto {
    private String email;
    private String password;
    private String nickname;
    private String status;
}