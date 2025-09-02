package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
