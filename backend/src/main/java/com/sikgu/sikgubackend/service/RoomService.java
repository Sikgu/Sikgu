package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.ModelCoordinateDto;
import com.sikgu.sikgubackend.dto.MyRoomDto;
import com.sikgu.sikgubackend.dto.RoomDto;
import com.sikgu.sikgubackend.entity.Coordinate;
import com.sikgu.sikgubackend.entity.Model3D;
import com.sikgu.sikgubackend.entity.Room;
import com.sikgu.sikgubackend.repository.CoordinateRepository;
import com.sikgu.sikgubackend.repository.Model3DRepository;
import com.sikgu.sikgubackend.repository.RoomRepository;
import com.sikgu.sikgubackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final Model3DRepository model3DRepository;
    private final CoordinateRepository coordinateRepository;

    @Transactional
    public void clearMyRoom(String email) {
        Room room = roomRepository.findByUserEmail(email)
                .orElseThrow(() -> {
                    return new IllegalArgumentException("사용자의 방을 찾을 수 없습니다.");
                });

        coordinateRepository.deleteAllByRoom(room);
    }

    @Transactional
    public void updateMyRoom(String email, MyRoomDto myRoomDto) {
        Room room = roomRepository.findByUserEmail(email)
                .orElseThrow(() -> {
                    return new IllegalArgumentException("사용자의 방을 찾을 수 없습니다.");
                });

        room.updateRoomInfo(room.getWidth(), room.getDepth(), room.getHeight());
        roomRepository.save(room);

        coordinateRepository.saveAll(myRoomDto.getCoordinates().stream()
                .map(c -> {
                    Model3D model = model3DRepository.findByName(c.getName());
                    Optional<Coordinate> optionalCoordinate = coordinateRepository.findByModel(model);
                    Coordinate coordinate;
                    if (optionalCoordinate.isPresent()) {
                        coordinate = optionalCoordinate.get();
                        coordinate.updateCoordinate(c.getX(), c.getY(), c.getZ(), c.getRotation());
                    } else {
                        coordinate = Coordinate.builder()
                                .room(room)
                                .model(model)
                                .x(c.getX())
                                .y(c.getY())
                                .z(c.getZ())
                                .rotation(c.getRotation())
                                .build();
                    }
                    return coordinate;
                })
                .collect(Collectors.toList()));
    }

    @Transactional(readOnly = true)
    public MyRoomDto getMyRoom(String email) {

        Optional<Room> optionalRoom = roomRepository.findByUserEmail(email);

        Room room;
        if (optionalRoom.isPresent()) {
            room = optionalRoom.get();
        } else {
            room = userRepository.findByEmail(email)
                    .map(user -> Room.builder().user(user).width(15L).depth(15L).height(10L).build())
                    .orElseThrow(() -> {
                        return new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다: " + email);
                    });
        }

        RoomDto roomDto = new RoomDto(room.getWidth(), room.getHeight(), room.getDepth());

        List<ModelCoordinateDto> coordinates = coordinateRepository.findAllByRoom(room).stream()
                .map(c -> new ModelCoordinateDto(c.getModel().getName(), c.getX(), c.getY(), c.getZ(), c.getRotation()))
                .collect(Collectors.toList());

        return new MyRoomDto(roomDto, coordinates);
    }
}
