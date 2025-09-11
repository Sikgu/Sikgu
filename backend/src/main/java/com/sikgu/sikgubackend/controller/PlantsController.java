package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.service.PlantsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/plants")
@Tag(name = "식물", description = "식물 추천 및 관리 API")
public class PlantsController {

    private final PlantsService plantsService;

    public PlantsController(PlantsService plantsService) {
        this.plantsService = plantsService;
    }

    @Operation(summary = "식물 추천", description = "사용자 환경에 맞는 식물 목록을 추천합니다.")
    @GetMapping("/recommendations")
    public ResponseEntity<List<String>> getRecommendations(@RequestParam String environment) {
        List<String> recommendations = plantsService.getRecommendations(environment);
        return ResponseEntity.ok(recommendations);
    }

    @Operation(summary = "식물 관리 가이드", description = "특정 식물에 대한 관리 가이드를 제공합니다.")
    @GetMapping("/care-guide")
    public ResponseEntity<String> getCareGuide(@RequestParam String plantName) {
        String careGuide = plantsService.getCareGuide(plantName);
        return ResponseEntity.ok(careGuide);
    }
}