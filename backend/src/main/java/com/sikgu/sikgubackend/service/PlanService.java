package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.PlanDto;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class PlanService {
    public List<PlanDto> getAllPlans() {
        // 실제로는 DB에서 플랜 목록을 조회합니다.
        PlanDto plan1 = new PlanDto();
        plan1.setPlanName("기본 요금제");
        plan1.setPrice(10000);
        plan1.setDescription("작은 식물용 기본 요금제입니다.");

        PlanDto plan2 = new PlanDto();
        plan2.setPlanName("프리미엄 요금제");
        plan2.setPrice(20000);
        plan2.setDescription("큰 식물용 프리미엄 요금제입니다.");

        return Arrays.asList(plan1, plan2);
    }
}