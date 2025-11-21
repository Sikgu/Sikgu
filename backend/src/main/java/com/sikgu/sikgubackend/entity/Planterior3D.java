//package com.sikgu.sikgubackend.entity;
//
//import com.sikgu.sikgubackend.entity.base.BaseEntity;
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//import lombok.*;
//
//@Getter
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@Entity
//@Table(name = "planterior3d")
//public class Planterior3D extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "plant_modeling_url", length = 512)
//    private String plantModelingURL;
//
//    @Builder
//    public Planterior3D(String url, LocalDateTime createdAt) {
//        this.plantModelingURL = url;
//    }
//}