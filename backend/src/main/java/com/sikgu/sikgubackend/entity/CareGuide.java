package com.sikgu.sikgubackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@Table(name = "care_guide")
public class CareGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder
    public CareGuide(String watering, String light, String temperature, String humidity, String fertilizer, String tips) {
        this.watering = watering;
        this.light = light;
        this.temperature = temperature;
        this.humidity = humidity;
        this.fertilizer = fertilizer;
        this.tips = tips;
    }

    @Lob
    private String watering;

    @Lob
    private String light;

    @Lob
    private String temperature;

    @Lob
    private String humidity;

    @Lob
    private String fertilizer;

    @Lob
    private String tips;
}
