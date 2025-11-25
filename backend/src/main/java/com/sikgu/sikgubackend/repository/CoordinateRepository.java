package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Coordinate;
import com.sikgu.sikgubackend.entity.Model3D;
import com.sikgu.sikgubackend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoordinateRepository extends JpaRepository<Coordinate, Long> {
    List<Coordinate> findAllByRoom(Room room);

    void deleteAllByRoom(Room room);

    Optional<Coordinate> findByModel(Model3D model);
}
