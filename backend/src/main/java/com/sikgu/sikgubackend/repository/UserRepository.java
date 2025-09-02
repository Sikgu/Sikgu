package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
