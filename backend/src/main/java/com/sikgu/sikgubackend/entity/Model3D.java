package com.sikgu.sikgubackend.entity;

import com.sikgu.sikgubackend.entity.base.BaseEntity;
import jakarta.persistence.*;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "model_3d")
public class Model3D extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(name = "modeling_url", length = 512)
    private String modelingURL;

    @Column(nullable = false)
    private Double height;

    @Column(nullable = true)
    private Boolean canPlaceOn;

    @Column(nullable = true)
    private Boolean onlyOnSideBoard;
}