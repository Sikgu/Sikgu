package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    /**
     * 특정 사용자의 모든 주문 내역과 주문 항목(OrderItem)을 한 번에 조회합니다.
     * N+1 문제를 방지하기 위해 JOIN FETCH를 사용합니다.
     */
    @Query("SELECT o FROM Order o JOIN FETCH o.items oi JOIN FETCH o.user u WHERE u.email = :email ORDER BY o.orderDate DESC")
    List<Order> findByUserEmail(@Param("email") String email);
}