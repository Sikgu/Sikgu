package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantRepository extends JpaRepository<Plant, Long> {
}
