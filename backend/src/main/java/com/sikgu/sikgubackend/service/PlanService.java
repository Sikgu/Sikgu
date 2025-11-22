package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.response.PlanDto;
import com.sikgu.sikgubackend.entity.Plan;
import com.sikgu.sikgubackend.repository.PlanRepository;
import lombok.RequiredArgsConstructor; // AllArgsConstructor 대신 RequiredArgsConstructor 사용 권장
import lombok.extern.slf4j.Slf4j; // SLF4J 로깅 추가
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException; // 예외 처리용 임포트

@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<PlanDto> findAll() {
        log.debug("PLAN_READ: Attempting to retrieve all plans.");
        List<PlanDto> plans = planRepository.findAll().stream()
                .map(plan -> new PlanDto(plan.getId(), plan.getName(), plan.getPrice(), plan.getCoins(), plan.getBenefits()))
                .toList();

        log.info("PLAN_READ SUCCESS: Retrieved {} plans.", plans.size());
        return plans;
    }

    public PlanDto findById(Long planId) {
        log.debug("PLAN_READ: Attempting to retrieve plan with ID: {}", planId);

        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> {
                    log.warn("PLAN_READ FAILED: Plan not found with ID: {}", planId);
                    return new NoSuchElementException("ID " + planId + "에 해당하는 플랜을 찾을 수 없습니다.");
                });

        log.info("PLAN_READ SUCCESS: Plan {} retrieved.", planId);

        return new PlanDto(
            plan.getId(),
            plan.getName(),
            plan.getPrice(),
            plan.getCoins(),
            plan.getBenefits()
        );
    }
}