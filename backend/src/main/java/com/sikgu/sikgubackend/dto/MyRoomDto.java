package com.sikgu.sikgubackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyRoomDto {
    private RoomDto room;
    private List<ModelCoordinateDto> coordinates;
}
