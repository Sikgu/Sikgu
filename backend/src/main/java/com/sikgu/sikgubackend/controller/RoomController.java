package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.MyRoomDto;
import com.sikgu.sikgubackend.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<MyRoomDto> getMyRoom(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        MyRoomDto myRoomDto = roomService.getMyRoom(email);

        return ResponseEntity.ok(myRoomDto);
    }

    @PostMapping
    public ResponseEntity<Void> updateMyRoom(@AuthenticationPrincipal UserDetails userDetails, @RequestBody MyRoomDto myRoomDto) {
        String email = userDetails.getUsername();

        roomService.clearMyRoom(email);
        roomService.updateMyRoom(email, myRoomDto);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
