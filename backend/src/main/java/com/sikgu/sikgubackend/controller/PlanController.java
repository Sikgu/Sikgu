package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.PlanDto;
import com.sikgu.sikgubackend.service.PlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/plans")
@Tag(name = "구독 플랜", description = "구독 플랜 조회 API")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @Operation(summary = "구독 플랜 목록 조회", description = "사용 가능한 모든 구독 플랜 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<PlanDto>> getPlans() {
        List<PlanDto> plans = planService.getAllPlans();
        return ResponseEntity.ok(plans);
    }
}