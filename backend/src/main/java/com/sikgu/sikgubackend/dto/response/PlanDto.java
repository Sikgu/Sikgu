package com.sikgu.sikgubackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanDto {
    Long id;
    String name;
    Long price;
    Long coins;
    List<String> benefits;
}
