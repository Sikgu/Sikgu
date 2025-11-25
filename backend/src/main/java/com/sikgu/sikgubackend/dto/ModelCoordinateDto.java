package com.sikgu.sikgubackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModelCoordinateDto {

    private String name;

    private double x;
    private double y;
    private double z;

    private double rotation;
}
