package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}