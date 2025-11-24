package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("SELECT r FROM Room r JOIN r.user u WHERE u.email = :email")
    Optional<Room> findByUserEmail(@Param("email") String email);
}
