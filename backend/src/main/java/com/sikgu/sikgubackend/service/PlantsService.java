package com.sikgu.sikgubackend.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class PlantsService {
    public List<String> getRecommendations(String environment) {
        // 실제로는 환경 정보를 바탕으로 DB에서 식물을 추천합니다.
        if ("indoors".equalsIgnoreCase(environment)) {
            return Arrays.asList("몬스테라", "스투키", "산세베리아");
        }
        return Arrays.asList("해바라기", "장미", "국화");
    }

    public String getCareGuide(String plantName) {
        // 실제로는 식물 이름을 기반으로 DB에서 관리 가이드를 조회합니다.
        return plantName + " 관리에 대한 가이드입니다.";
    }
}