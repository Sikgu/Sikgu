package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Coordinate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoordinateRepository extends JpaRepository<Coordinate, Long> {
}
