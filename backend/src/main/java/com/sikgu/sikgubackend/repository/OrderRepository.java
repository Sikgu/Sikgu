package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}