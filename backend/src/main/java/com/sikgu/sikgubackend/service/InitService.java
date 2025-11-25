package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.entity.Furniture;
import com.sikgu.sikgubackend.entity.Plan;
import com.sikgu.sikgubackend.entity.Plant;
import com.sikgu.sikgubackend.repository.FurnitureRepository;
import com.sikgu.sikgubackend.repository.PlanRepository;
import com.sikgu.sikgubackend.repository.PlantRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class InitService {

    private final PlanRepository planRepository;
    private final PlantRepository plantRepository;
    private final FurnitureRepository furnitureRepository;

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<Plant> getAllPlants() {
        return plantRepository.findAll();
    }

    public List<Furniture> getAllFurniture() {
        return furnitureRepository.findAll();
    }
}
