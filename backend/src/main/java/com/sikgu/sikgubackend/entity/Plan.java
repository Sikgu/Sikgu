package com.sikgu.sikgubackend.entity;

import com.sikgu.sikgubackend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "plan")
public class Plan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Long price;

    private Long coins;

//    @Builder.Default
//    @ManyToMany(fetch = FetchType.LAZY) // 실무에서는 지연 로딩(LAZY) 권장
//    @JoinTable(
//            name = "plan_features", // 중간 조인 테이블 이름
//            joinColumns = @JoinColumn(name = "plan_id"), // Plan을 참조하는 외래 키
//            inverseJoinColumns = @JoinColumn(name = "benefit_id") // Feature를 참조하는 외래 키
//    )
//    private Set<Benefit> benefits = new HashSet<>();


    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "plant_benefit", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "benefit_description")
    @Builder.Default
    private List<String> benefits = new ArrayList<>();

}