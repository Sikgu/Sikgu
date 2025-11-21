package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.response.PlanDto;
import com.sikgu.sikgubackend.entity.Plan;
import com.sikgu.sikgubackend.repository.PlanRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<PlanDto> findAll() {
        return planRepository.findAll().stream()
                .map((Plan plan) -> new PlanDto(plan.getId(), plan.getName(), plan.getPrice(), plan.getCoins(), plan.getBenefits()))
                .toList();
    }

    public PlanDto findById(Long planId) {
        Plan plan = planRepository.findById(planId).get();

        return new PlanDto(plan.getId(), plan.getName(), plan.getPrice(), plan.getCoins(), plan.getBenefits());
    }
}