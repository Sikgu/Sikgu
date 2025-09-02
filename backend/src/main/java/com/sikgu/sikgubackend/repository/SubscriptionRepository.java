package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
}
