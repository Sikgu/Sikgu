package com.sikgu.sikgubackend.dto.response;

import com.sikgu.sikgubackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String address;
    private String phoneNumber;
    private Long coins;
    private List<SubscriptionResponse> subscriptions;

    public UserDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.address = user.getAddress();
        this.phoneNumber = user.getPhoneNumber();
        this.coins = user.getCoins();

        this.subscriptions = user.getSubscriptions().stream()
                .map(SubscriptionResponse::new)
                .collect(Collectors.toList());
    }
}