package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.response.PlanDto;
import com.sikgu.sikgubackend.entity.Furniture;
import com.sikgu.sikgubackend.entity.Plan;
import com.sikgu.sikgubackend.entity.Plant;
import com.sikgu.sikgubackend.service.InitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Deprecated
@RestController
@RequestMapping("/init")
public class InitController {
    private final InitService initService;

    @Autowired
    public InitController(InitService initService) {
        this.initService = initService;
    }

    @GetMapping("/plans")
    public List<PlanDto> getAllPlan() {
        return initService.getAllPlans().stream()
                .map((Plan plan) -> new PlanDto(plan.getId(), plan.getName(), plan.getPrice(), plan.getCoins(), plan.getBenefits()))
                .toList();
    }

    @GetMapping("/plants")
    public List<Plant> getAllPlants() {
        return initService.getAllPlants();
    }

    @GetMapping("/furniture")
    public List<Furniture> getAllFurniture() {
        return initService.getAllFurniture();
    }
}
