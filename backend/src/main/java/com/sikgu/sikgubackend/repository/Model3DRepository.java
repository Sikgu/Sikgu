package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Model3D;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Model3DRepository extends JpaRepository<Model3D, Long> {
    Model3D findByName(String name);
}
