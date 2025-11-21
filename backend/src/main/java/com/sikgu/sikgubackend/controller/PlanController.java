package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.response.PlanDto;
import com.sikgu.sikgubackend.service.PlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/plans")
//@Tag(name = "미구현", description = "구독 플랜 조회 API")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<List<PlanDto>> getAllPlans() {
        return ResponseEntity.ok(planService.findAll());
    }

    @GetMapping("/{plan_id}")
    public ResponseEntity<PlanDto> getPlanById(@PathVariable("plan_id") Long planId) {
        return ResponseEntity.ok(planService.findById(planId));
    }
}