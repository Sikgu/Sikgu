package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
}
