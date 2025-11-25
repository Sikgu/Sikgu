package com.sikgu.sikgubackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {

    private Long plantId;
    private String plantName;
    private Long plantPrice;
    private int quantity;
    private Long itemTotal;
}