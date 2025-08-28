package com.sikgu.sikgubackend.entity;

import com.sikgu.sikgubackend.entity.base.BaseEntity;
import com.sikgu.sikgubackend.entity.enums.PlantCondition;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "plant")
public class Plant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.ORDINAL)
    private PlantCondition light;

    @Enumerated(EnumType.ORDINAL)
    private PlantCondition humidity;

    @Enumerated(EnumType.ORDINAL)
    private PlantCondition temp;

    @Column(columnDefinition = "TEXT")
    private String caution;
}