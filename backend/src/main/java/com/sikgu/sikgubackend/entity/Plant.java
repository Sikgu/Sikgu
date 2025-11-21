package com.sikgu.sikgubackend.entity;

import com.sikgu.sikgubackend.entity.base.BaseEntity;
import com.sikgu.sikgubackend.entity.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "plant")
public class Plant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlantSize size;

    @Column(nullable = false)
    private Long coins;

    @Enumerated(EnumType.STRING)
    private LightCondition lightCondition;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    private Humidity humidityTag;

    @Column(nullable = false)
    private String lightCategory;

    @Lob
    @Column(nullable = false)
    private String description;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "care_guide_id")
    private CareGuide careGuide;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "plant_features", joinColumns = @JoinColumn(name = "plant_id"))
    @Column(name = "feature_description")
    @Builder.Default
    private List<String> features = new ArrayList<>();


    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "plant_images", joinColumns = @JoinColumn(name = "plant_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();
//    @Column(name = "plant_image_url", length = 512)
//    private String plantImageURL;

//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "planterior3D_id")
//    private Planterior3D planterior3D;

    @Column(name = "modeling_url", length = 512)
    private String modelingURL;

    @Builder.Default
    @OneToMany(mappedBy = "plant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    @Lob
    @Column(name = "care_tip", columnDefinition = "LONGTEXT", nullable = false)
    private String careTip;

    public void addCartItem(CartItem cartItem) {
        items.add(cartItem);
        cartItem.assignPlant(this);
    }
}