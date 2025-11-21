package com.sikgu.sikgubackend.config;

import com.sikgu.sikgubackend.entity.*;
import com.sikgu.sikgubackend.entity.enums.*;
import com.sikgu.sikgubackend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitConfig {

    @Bean
    public CommandLineRunner initUser(UserRepository userRepository) {
        return args -> {

        };
    }

    @Bean
    public CommandLineRunner initPlan(PlanRepository planRepository) {
        return args -> {
            Plan oneCoin = Plan.builder()
                    .name("1 코인 플랜")
                    .coins(1L)
                    .price(4900L)
                    .benefits(List.of(
                            "소형 식물 (선인장, 다육식물) 선택 가능",
                            "기본 관리 가이드 제공",
                            "식물 맞춤 리마인더 제공"
                    ))
                    .build();

            Plan twoCoin = Plan.builder()
                    .name("2 코인 플랜")
                    .coins(2L)
                    .price(9900L)
                    .benefits(List.of(
                            "중형 식물 (몬스테라, 고무나무) 선택 가능",
                            "기본 관리 가이드 제공",
                            "식물 맞춤 리마인더 제공"
                    ))
                    .build();

            Plan fiveCoin = Plan.builder()
                    .name("5 코인 플랜")
                    .coins(5L)
                    .price(23900L)
                    .benefits(List.of(
                            "대형 식물 (야자수, 벤자민고무나무) 선택 가능",
                            "기본 관리 가이드 제공",
                            "식물 맞춤 리마인더 제공"
                    ))
                    .build();

            Plan tenCoin = Plan.builder()
                    .name("10 코인 플랜")
                    .coins(10L)
                    .price(44900L)
                    .benefits(List.of(
                            "특별한 대형 식물 (올리브나무, 유칼립투스) 선택 가능",
                            "기본 관리 가이드 제공",
                            "식물 맞춤 리마인더 제공"
                    ))
                    .build();


            planRepository.saveAll(List.of(oneCoin, twoCoin, fiveCoin, tenCoin));
        };
    }

    @Bean
    public CommandLineRunner initPlant(PlantRepository plantRepository) {
        return args -> {
            CareGuide tillandsiaCareGuide = CareGuide.builder()
                    .watering("주 2-3회 분무기로 살짝 뿌려주세요. 아침 시간대에 물을 주는 것이 좋습니다.")
                    .light("밝은 간접광을 선호합니다. 직사광선은 피해주세요.")
                    .temperature("18-24°C 정도의 온도가 적당합니다.")
                    .humidity("습도는 40-60% 정도로 유지해주세요.")
                    .fertilizer("월 1회 희석한 액체비료를 분무해주세요.")
                    .tips("통풍이 잘 되는 곳에 두고, 에어컨이나 난방기 바람은 피해주세요.")
                    .build();

            Plant tillandsia = Plant.builder()
                    .name("틸란드시아")
                    .size(PlantSize.SMALL)
                    .coins(1L)
                    .lightCondition(LightCondition.SEMI_SHADE)
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.DRY)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("틸란드시아는 흙 없이도 자랄 수 있는 독특한 공중식물입니다. 공기 중의 수분과 영양분을 흡수하여 생존하며, 독특한 외형으로 인테리어 소품으로 인기가 높습니다.")
                    .images(List.of(
                            "/images/tillandsia.jpg",
                            "https://images.unsplash.com/photo-1565006836881-0c92f7d5d334?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/small/Tillandsia.glb")
                    .careGuide(tillandsiaCareGuide)
                    .features(List.of(
                            "흙이 필요 없음",
                            "관리가 매우 쉬움",
                            "독특한 외형",
                            "공간 활용도 높음"
                    ))
                    .careTip("      <h3>✨ 틸란드시아란?</h3>\n" +
                            "      <p>틸란드시아는 흙 없이도 자랄 수 있는 독특한 공중식물입니다. 공기 중의 수분과 영양분을 흡수하여 생존합니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 주 2-3회 분무기로 살짝 뿌려주세요</p>\n" +
                            "      <p>• 아침 시간대에 물을 주는 것이 좋습니다</p>\n" +
                            "      <p>• 물을 너무 많이 주면 뿌리가 썩을 수 있으니 주의하세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 간접광을 선호합니다</p>\n" +
                            "      <p>• 직사광선은 피해주세요</p>\n" +
                            "      <p>• 통풍이 잘 되는 곳에 두세요</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF21\uFE0F 온도와 습도</h3>\n" +
                            "      <p>• 18-24°C 정도의 온도가 적당합니다</p>\n" +
                            "      <p>• 습도는 40-60% 정도로 유지해주세요</p>\n" +
                            "      <p>• 에어컨이나 난방기 바람은 피해주세요</p>")
                    .build();

            plantRepository.save(tillandsia);

            CareGuide miniCactusCareGuide = CareGuide.builder()
                    .watering("흙이 완전히 마른 후 물을 주세요 (2-3주에 한 번). 겨울에는 한 달에 한 번 정도로 줄여주세요.")
                    .light("하루 최소 6시간 이상의 직사광선이 필요합니다. 남향 창가가 가장 좋습니다.")
                    .temperature("15-30°C 사이의 온도를 선호합니다. 겨울에는 10°C 이상 유지해주세요.")
                    .humidity("건조한 환경을 선호합니다. 습한 곳은 피해주세요.")
                    .fertilizer("성장기(봄, 여름)에 월 1회 선인장 전용 비료를 주세요.")
                    .tips("과습은 뿌리 썩음의 원인이 됩니다. 배수가 잘 되는 흙을 사용하세요.")
                    .build();

            Plant miniCactus = Plant.builder()
                    .name("미니 선인장")
                    .size(PlantSize.SMALL)
                    .coins(1L)
                    .lightCondition(LightCondition.DIRECT_LIGHT)
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.DRY)
                    .lightCategory("햇빛이 잘 들어요")
                    .description("미니 선인장은 물을 적게 주고 햇빛을 좋아하는 관리하기 쉬운 식물입니다. 작은 크기로 책상이나 창가에 두기 좋으며, 다양한 품종을 모으는 재미가 있습니다.")
                    .images(List.of(
                            "/images/mini-cactus.jpg",
                            "https://images.unsplash.com/photo-1558603668-6570496b66f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/small/Mini_Cactus.glb")
                    .careGuide(miniCactusCareGuide)
                    .features(List.of("물주기 간단", "햇빛을 좋아함", "다양한 품종", "초보자에게 적합"))
                    .careTip("      <h3>\uD83C\uDF35 미니 선인장 특징</h3>\n" +
                            "      <p>미니 선인장은 물을 적게 주고 햇빛을 좋아하는 관리하기 쉬운 식물입니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙이 완전히 마른 후 물을 주세요 (2-3주에 한 번)</p>\n" +
                            "      <p>• 겨울에는 한 달에 한 번 정도로 줄여주세요</p>\n" +
                            "      <p>• 화분 밑으로 물이 빠질 때까지 충분히 주세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 하루 최소 6시간 이상의 직사광선이 필요합니다</p>\n" +
                            "      <p>• 남향 창가가 가장 좋습니다</p>\n" +
                            "      <p>• 빛이 부족하면 웃자라게 됩니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF21\uFE0F 온도 관리</h3>\n" +
                            "      <p>• 15-30°C 사이의 온도를 선호합니다</p>\n" +
                            "      <p>• 겨울에는 10°C 이상 유지해주세요</p>\n" +
                            "      <p>• 급격한 온도 변화는 피해주세요</p>")
                    .build();

            plantRepository.save(miniCactus);

            CareGuide calatheaOrbifoliaCareGuide = CareGuide.builder()
                    .watering("흙 표면이 살짝 마르면 물을 주세요. 뿌리 부분이 항상 촉촉하게 유지되도록 하세요.")
                    .light("밝은 간접광을 선호합니다. 직사광선에 노출되면 잎이 탈 수 있습니다.")
                    .temperature("18-25°C의 온도가 적당합니다. 급격한 온도 변화는 피해주세요.")
                    .humidity("습도 60% 이상을 유지해주세요. 가습기나 물받이를 활용하세요.")
                    .fertilizer("성장기에 월 2회 희석한 액체비료를 주세요.")
                    .tips("잎에 직접 분무하지 마세요. 얼룩이 생길 수 있습니다. 정수된 물이나 빗물을 사용하는 것이 좋습니다.")
                    .build();

            Plant calatheaOrbifolia = Plant.builder()
                    .name("칼라데아 오르비폴리아")
                    .size(PlantSize.SMALL)
                    .coins(1L)
                    .lightCondition(LightCondition.INDIRECT_LIGHT)
                    .difficulty(Difficulty.HARD)
                    .humidityTag(Humidity.HUMID)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("칼라데아 오르비폴리아는 독특한 줄무늬 잎이 특징인 관엽식물입니다. 높은 습도를 좋아하며, 섬세한 관리가 필요하지만 그만큼 아름다운 잎무늬를 자랑합니다.")
                    .images(List.of(
                            "/images/calathea-orbifolia.jpg",
                            "https://images.unsplash.com/photo-1597689879203-46e57cd74336?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/small/Calathea_Orbifolia.glb")
                    .careGuide(calatheaOrbifoliaCareGuide)
                    .features(List.of("아름다운 잎무늬", "공기정화 효과", "독특한 외형", "습도를 좋아함"))
                    .careTip("      <h3>\uD83C\uDFA8 칼라데아의 매력</h3>\n" +
                            "      <p>칼라데아 오르비폴리아는 독특한 줄무늬 잎이 특징인 관엽식물로, 높은 습도를 좋아합니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙 표면이 살짝 마르면 물을 주세요</p>\n" +
                            "      <p>• 뿌리 부분이 항상 촉촉하게 유지되도록 하세요</p>\n" +
                            "      <p>• 정수된 물이나 빗물을 사용하는 것이 좋습니다</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 간접광을 선호합니다</p>\n" +
                            "      <p>• 직사광선에 노출되면 잎이 탈 수 있습니다</p>\n" +
                            "      <p>• 북향이나 동향 창가가 적합합니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA8 습도 관리</h3>\n" +
                            "      <p>• 습도 60% 이상을 유지해주세요</p>\n" +
                            "      <p>• 가습기나 물받이를 활용하세요</p>\n" +
                            "      <p>• 잎에 직접 분무하지 마세요 (얼룩이 생길 수 있음)</p>")
                    .build();

            plantRepository.save(calatheaOrbifolia);

            CareGuide scindapsusCareGuide = CareGuide.builder()
                    .watering("흙 표면이 마르면 물을 주세요. 주 1-2회 정도가 적당합니다.")
                    .light("반음지에서도 잘 자랍니다. 형광등 불빛만으로도 생육 가능합니다.")
                    .temperature("18-27°C의 온도를 선호합니다.")
                    .humidity("보통 습도에서 잘 자랍니다. 건조해도 잘 견딥니다.")
                    .fertilizer("성장기에 월 1-2회 액체비료를 주세요.")
                    .tips("너무 길어진 덩굴은 잘라주세요. 잘라낸 가지를 물에 꽂으면 뿌리가 나와 새로운 식물로 키울 수 있습니다.")
                    .build();

            Plant scindapsus = Plant.builder()
                    .name("스킨답서스")
                    .size(PlantSize.SMALL)
                    .coins(1L)
                    .lightCondition(LightCondition.SEMI_SHADE) // 반음지/음지 -> 반음지로 대표
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.NORMAL)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("스킨답서스는 관리가 쉽고 공기정화 능력이 뛰어난 덩굴성 식물입니다. 반음지에서도 잘 자라며, 물꽂이로 쉽게 번식할 수 있어 초보자에게 인기가 높습니다.")
                    .images(List.of(
                            "/images/scindapsus.jpg",
                            "https://images.unsplash.com/photo-1597082980533-ec368d0b5c0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/small/Golden_Pothos.glb")
                    .careGuide(scindapsusCareGuide)
                    .features(List.of("초보자 추천", "공기정화 우수", "번식이 쉬움", "어두운 곳 가능"))
                    .careTip("      <h3>\uD83C\uDF3F 스킨답서스란?</h3>\n" +
                            "      <p>스킨답서스는 관리가 쉽고 공기정화 능력이 뛰어난 덩굴성 식물입니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙 표면이 마르면 물을 주세요</p>\n" +
                            "      <p>• 주 1-2회 정도가 적당합니다</p>\n" +
                            "      <p>• 과습보다는 약간 건조하게 관리하세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 반음지에서도 잘 자랍니다</p>\n" +
                            "      <p>• 형광등 불빛만으로도 생육 가능합니다</p>\n" +
                            "      <p>• 너무 어두우면 잎의 무늬가 사라집니다</p>\n" +
                            "      \n" +
                            "      <h3>✂\uFE0F 가지치기와 번식</h3>\n" +
                            "      <p>• 너무 길어진 덩굴은 잘라주세요</p>\n" +
                            "      <p>• 잘라낸 가지를 물에 꽂으면 뿌리가 나옵니다</p>\n" +
                            "      <p>• 뿌리가 나면 흙에 심어 새로운 식물로 키울 수 있습니다</p>")
                    .build();

            plantRepository.save(scindapsus);

            CareGuide monsteraCareGuide = CareGuide.builder()
                    .watering("흙 표면 2-3cm가 마르면 물을 주세요. 겨울에는 물주기 횟수를 줄여주세요.")
                    .light("밝은 간접광을 선호합니다. 직사광선은 잎을 태울 수 있습니다.")
                    .temperature("18-25°C의 온도가 적당합니다.")
                    .humidity("습도 60% 이상을 유지하면 좋습니다. 분무기로 잎에 물을 뿌려주세요.")
                    .fertilizer("성장기(봄, 여름)에 월 1-2회 액체비료를 주세요.")
                    .tips("몬스테라는 덩굴성 식물이므로 지지대가 필요합니다. 코코넛 섬유나 이끼봉을 사용하세요.")
                    .build();

            Plant monstera = Plant.builder()
                    .name("몬스테라")
                    .size(PlantSize.MEDIUM)
                    .coins(2L)
                    .lightCondition(LightCondition.INDIRECT_LIGHT)
                    .difficulty(Difficulty.NORMAL)
                    .humidityTag(Humidity.NORMAL)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("몬스테라는 구멍이 뚫린 독특한 잎으로 유명한 열대식물입니다. 인스타그램에서 가장 인기 있는 인테리어 식물 중 하나로, 성장하면서 잎에 아름다운 구멍과 갈래가 생깁니다.")
                    .images(List.of(
                            "/images/monstera.jpg",
                            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/middle/Monstera.glb")
                    .careGuide(monsteraCareGuide)
                    .features(List.of("공기정화 능력 우수", "실내 인테리어에 최적", "관리가 비교적 쉬움", "성장이 빠름"))
                    .careTip("      <h3>\uD83D\uDD73\uFE0F 몬스테라의 특징</h3>\n" +
                            "      <p>몬스테라는 구멍이 뚫린 독특한 잎으로 유명한 열대식물입니다. 성장하면서 잎에 구멍과 갈래가 생깁니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙 표면 2-3cm가 마르면 물을 주세요</p>\n" +
                            "      <p>• 겨울에는 물주기 횟수를 줄여주세요</p>\n" +
                            "      <p>• 화분 받침에 고인 물은 제거해주세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 간접광을 선호합니다</p>\n" +
                            "      <p>• 직사광선은 잎을 태울 수 있습니다</p>\n" +
                            "      <p>• 빛이 부족하면 구멍이 생기지 않을 수 있습니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF31 지지대 설치</h3>\n" +
                            "      <p>• 몬스테라는 덩굴성 식물이므로 지지대가 필요합니다</p>\n" +
                            "      <p>• 코코넛 섬유나 이끼봉을 사용하세요</p>\n" +
                            "      <p>• 기근(공중뿌리)이 나오면 지지대에 유도해주세요</p>")
                    .build();

            plantRepository.save(monstera);

            CareGuide ladysSlipperCareGuide = CareGuide.builder()
                    .watering("흙이 촉촉하게 유지되도록 물을 주세요. 주 2-3회 정도가 적당합니다.")
                    .light("밝은 직사광선을 좋아합니다. 남향 창가가 가장 적합합니다.")
                    .temperature("20-25°C의 온도를 선호합니다.")
                    .humidity("보통 습도에서 잘 자랍니다.")
                    .fertilizer("성장기에 월 1-2회 액체비료를 주세요.")
                    .tips("통풍이 잘 되는 곳에 두세요. 급격한 환경 변화는 피해주세요.")
                    .build();

            Plant ladysSlipper = Plant.builder()
                    .name("여인초")
                    .size(PlantSize.MEDIUM)
                    .coins(2L)
                    .lightCondition(LightCondition.DIRECT_LIGHT)
                    .difficulty(Difficulty.NORMAL)
                    .humidityTag(Humidity.NORMAL)
                    .lightCategory("햇빛이 잘 들어요")
                    .description("여인초는 우아한 잎의 형태와 섬세한 아름다움으로 사랑받는 관엽식물입니다. 밝은 햇빛을 좋아하며, 적절한 관리로 오랫동안 건강하게 키울 수 있습니다.")
                    .images(List.of(
                            "/images/ladys-slipper.jpg",
                            "https://images.unsplash.com/photo-1463320726281-696a485928c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/middle/Travelers_Tree.glb")
                    .careGuide(ladysSlipperCareGuide)
                    .features(List.of("우아한 외형", "햇빛을 좋아함", "중형 크기", "인테리어 효과"))
                    .careTip("      <h3>\uD83C\uDF38 여인초란?</h3>\n" +
                            "      <p>여인초는 우아한 잎의 형태와 섬세한 아름다움으로 사랑받는 관엽식물입니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙이 촉촉하게 유지되도록 물을 주세요</p>\n" +
                            "      <p>• 주 2-3회 정도가 적당합니다</p>\n" +
                            "      <p>• 잎에 물이 닿지 않도록 주의하세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 직사광선을 좋아합니다</p>\n" +
                            "      <p>• 남향 창가가 가장 적합합니다</p>\n" +
                            "      <p>• 빛이 부족하면 잎이 처질 수 있습니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF21\uFE0F 온도와 환경</h3>\n" +
                            "      <p>• 20-25°C의 온도를 선호합니다</p>\n" +
                            "      <p>• 통풍이 잘 되는 곳에 두세요</p>\n" +
                            "      <p>• 급격한 환경 변화는 피해주세요</p>")
                    .build();

            plantRepository.save(ladysSlipper);

            CareGuide spathiphyllumCareGuide = CareGuide.builder()
                    .watering("흙이 항상 촉촉하게 유지되도록 하세요. 잎이 처지면 물이 부족한 신호입니다.")
                    .light("반음지에서도 잘 자랍니다. 형광등 빛만으로도 충분합니다.")
                    .temperature("18-24°C의 온도가 적당합니다.")
                    .humidity("습도가 높은 곳을 선호합니다.")
                    .fertilizer("월 1회 액체비료를 주세요.")
                    .tips("적절한 습도와 영양분 공급으로 흰 꽃을 피울 수 있습니다. 꽃이 시들면 줄기째 잘라주세요.")
                    .build();

            Plant spathiphyllum = Plant.builder()
                    .name("스파티필룸")
                    .size(PlantSize.MEDIUM)
                    .coins(2L)
                    .lightCondition(LightCondition.SEMI_SHADE) // 반음지/음지 -> 반음지로 대표
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.HUMID)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("스파티필룸은 평화백합이라고도 불리며, 우아한 흰색 꽃이 특징인 공기정화 식물입니다. 반음지에서도 잘 자라며, 물을 좋아해 관리가 쉽습니다.")
                    .images(List.of(
                            "/images/spathiphyllum.jpg",
                            "https://images.unsplash.com/photo-1591958911259-bee2173bdccc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/middle/Spathiphyllum.glb")
                    .careGuide(spathiphyllumCareGuide)
                    .features(List.of("아름다운 흰 꽃", "공기정화 최고", "어두운 곳 가능", "관리 쉬움"))
                    .careTip("      <h3>\uD83D\uDD4A\uFE0F 스파티필룸의 매력</h3>\n" +
                            "      <p>스파티필룸은 평화백합이라고도 불리며, 우아한 흰색 꽃이 특징인 공기정화 식물입니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙이 항상 촉촉하게 유지되도록 하세요</p>\n" +
                            "      <p>• 잎이 처지면 물이 부족한 신호입니다</p>\n" +
                            "      <p>• 받침에 고인 물도 그대로 두셔도 됩니다</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 반음지에서도 잘 자랍니다</p>\n" +
                            "      <p>• 너무 밝은 곳은 피해주세요</p>\n" +
                            "      <p>• 형광등 빛만으로도 충분합니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF38 꽃 피우기</h3>\n" +
                            "      <p>• 적절한 습도와 영양분 공급이 중요합니다</p>\n" +
                            "      <p>• 월 1회 액체비료를 주세요</p>\n" +
                            "      <p>• 꽃이 시들면 줄기째 잘라주세요</p>")
                    .build();

            plantRepository.save(spathiphyllum);

            CareGuide arecaPalmCareGuide = CareGuide.builder()
                    .watering("흙 표면이 마르면 충분히 물을 주세요. 주 1-2회 정도가 적당합니다.")
                    .light("밝은 간접광을 선호합니다. 반음지에서도 잘 자랍니다.")
                    .temperature("18-25°C의 온도를 선호합니다.")
                    .humidity("습도가 높은 곳을 좋아합니다. 분무기로 잎에 습도를 공급해주세요.")
                    .fertilizer("성장기에 월 1-2회 액체비료를 주세요.")
                    .tips("갈색으로 변한 잎은 제거해주세요. 먼지가 쌓이면 젖은 천으로 닦아주세요.")
                    .build();

            Plant arecaPalm = Plant.builder()
                    .name("아레카야자")
                    .size(PlantSize.MEDIUM)
                    .coins(2L)
                    .lightCondition(LightCondition.SEMI_SHADE)
                    .difficulty(Difficulty.NORMAL)
                    .humidityTag(Humidity.NORMAL)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("아레카야자는 열대 분위기를 연출하는 대표적인 관엽식물입니다. 공기정화 능력이 뛰어나며, 우아한 잎 모양으로 인테리어 효과가 좋습니다.")
                    .images(List.of(
                            "/images/areca-palm.jpg",
                            "https://images.unsplash.com/photo-1612363148951-f0e669f6b4b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/middle/Areca_Palm.glb")
                    .careGuide(arecaPalmCareGuide)
                    .features(List.of("열대 분위기", "공기정화 우수", "우아한 외형", "중형 크기"))
                    .careTip("      <h3>\uD83C\uDF34 아레카야자란?</h3>\n" +
                            "      <p>아레카야자는 열대 분위기를 연출하는 대표적인 관엽식물로, 공기정화 능력이 뛰어납니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙 표면이 마르면 충분히 물을 주세요</p>\n" +
                            "      <p>• 주 1-2회 정도가 적당합니다</p>\n" +
                            "      <p>• 겨울에는 물주기를 줄여주세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 간접광을 선호합니다</p>\n" +
                            "      <p>• 직사광선은 잎을 태울 수 있습니다</p>\n" +
                            "      <p>• 반음지에서도 잘 자랍니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF43 잎 관리</h3>\n" +
                            "      <p>• 갈색으로 변한 잎은 제거해주세요</p>\n" +
                            "      <p>• 분무기로 잎에 습도를 공급해주세요</p>\n" +
                            "      <p>• 먼지가 쌓이면 젖은 천으로 닦아주세요</p>")
                    .build();

            plantRepository.save(arecaPalm);

            CareGuide rubberTreeCareGuide = CareGuide.builder()
                    .watering("흙 표면이 2-3cm 마르면 물을 주세요. 과습을 피하고 적당히 건조하게 관리하세요.")
                    .light("밝은 간접광에서 가장 잘 자랍니다. 직사광선에도 잘 견딥니다.")
                    .temperature("18-25°C의 온도가 적당합니다.")
                    .humidity("건조한 환경을 선호합니다.")
                    .fertilizer("성장기에 월 1회 액체비료를 주세요.")
                    .tips("정기적으로 젖은 천으로 잎을 닦아주세요. 잎에 윤이 나는 제품을 사용할 수 있습니다.")
                    .build();

            Plant rubberTree = Plant.builder()
                    .name("고무나무")
                    .size(PlantSize.LARGE)
                    .coins(3L)
                    .lightCondition(LightCondition.INDIRECT_LIGHT)
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.DRY)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("고무나무는 두껍고 윤기나는 잎이 특징인 관엽식물입니다. 관리가 쉽고 공기정화 효과가 뛰어나며, 큰 잎으로 인테리어 효과가 좋습니다.")
                    .images(List.of(
                            "/images/rubber-tree.jpg",
                            "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/big/Rubber_Tree.glb")
                    .careGuide(rubberTreeCareGuide)
                    .features(List.of("윤기나는 큰 잎", "관리 매우 쉬움", "공기정화 효과", "대형 식물"))
                    .careTip("      <h3>\uD83C\uDF33 고무나무의 특징</h3>\n" +
                            "      <p>고무나무는 두껍고 윤기나는 잎이 특징인 관엽식물로, 관리가 쉽고 공기정화 효과가 뛰어납니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙 표면이 2-3cm 마르면 물을 주세요</p>\n" +
                            "      <p>• 과습을 피하고 적당히 건조하게 관리하세요</p>\n" +
                            "      <p>• 겨울에는 물주기 간격을 늘려주세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 간접광에서 가장 잘 자랍니다</p>\n" +
                            "      <p>• 직사광선에도 잘 견딥니다</p>\n" +
                            "      <p>• 빛이 부족하면 잎이 떨어질 수 있습니다</p>\n" +
                            "      \n" +
                            "      <h3>✨ 잎 관리</h3>\n" +
                            "      <p>• 정기적으로 젖은 천으로 잎을 닦아주세요</p>\n" +
                            "      <p>• 잎에 윤이 나는 제품을 사용할 수 있습니다</p>\n" +
                            "      <p>• 먼지가 쌓이면 광합성이 방해됩니다</p>")
                    .build();

            plantRepository.save(rubberTree);

            CareGuide birdOfParadiseCareGuide = CareGuide.builder()
                    .watering("흙이 촉촉하게 유지되도록 물을 주세요. 성장기에는 물을 충분히 주세요.")
                    .light("밝은 직사광선을 좋아합니다. 하루 최소 6시간 이상의 햇빛이 필요합니다.")
                    .temperature("18-25°C의 온도를 선호합니다.")
                    .humidity("보통 습도에서 잘 자랍니다.")
                    .fertilizer("성장기에 월 2회 액체비료를 주세요.")
                    .tips("실내에서는 꽃이 피기 어렵습니다. 충분한 공간과 햇빛이 필요하며, 최소 4-5년은 키워야 꽃이 핍니다.")
                    .build();

            Plant birdOfParadise = Plant.builder()
                    .name("극락조")
                    .size(PlantSize.LARGE)
                    .coins(3L)
                    .lightCondition(LightCondition.DIRECT_LIGHT)
                    .difficulty(Difficulty.NORMAL)
                    .humidityTag(Humidity.NORMAL)
                    .lightCategory("햇빛이 잘 들어요")
                    .description("극락조는 새의 부리를 닮은 독특한 꽃이 피는 식물입니다. 큰 잎과 이국적인 분위기로 실내 정원의 포인트가 되는 식물입니다.")
                    .images(List.of(
                            "/images/bird-of-paradise.jpg",
                            "https://images.unsplash.com/photo-1509423350716-97f2360af3e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/big/Paradise_Plant.glb")
                    .careGuide(birdOfParadiseCareGuide)
                    .features(List.of("이국적인 외형", "큰 잎", "독특한 꽃", "대형 식물"))
                    .careTip("      <h3>\uD83E\uDD9C 극락조란?</h3>\n" +
                            "      <p>극락조는 새의 부리를 닮은 독특한 꽃이 피는 식물로, 큰 잎과 이국적인 분위기가 매력적입니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙이 촉촉하게 유지되도록 물을 주세요</p>\n" +
                            "      <p>• 성장기에는 물을 충분히 주세요</p>\n" +
                            "      <p>• 겨울에는 물주기를 줄여주세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 직사광선을 좋아합니다</p>\n" +
                            "      <p>• 하루 최소 6시간 이상의 햇빛이 필요합니다</p>\n" +
                            "      <p>• 남향 창가가 가장 적합합니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF3A 꽃 피우기</h3>\n" +
                            "      <p>• 실내에서는 꽃이 피기 어렵습니다</p>\n" +
                            "      <p>• 충분한 공간과 햇빛이 필요합니다</p>\n" +
                            "      <p>• 최소 4-5년은 키워야 꽃이 핍니다</p>")
                    .build();

            plantRepository.save(birdOfParadise);

            CareGuide euphorbiaTrigonaCareGuide = CareGuide.builder()
                    .watering("흙이 완전히 마른 후 물을 주세요. 겨울에는 한 달에 한 번 정도만 주세요.")
                    .light("밝은 직사광선을 좋아합니다. 햇빛이 부족하면 웃자라게 됩니다.")
                    .temperature("15-30°C의 온도를 선호합니다.")
                    .humidity("건조한 환경을 선호합니다.")
                    .fertilizer("성장기에 월 1회 다육식물 전용 비료를 주세요.")
                    .tips("줄기를 자르면 흰 수액이 나옵니다. 수액은 독성이 있으니 피부에 닿지 않도록 주의하세요.")
                    .build();

            Plant euphorbiaTrigona = Plant.builder()
                    .name("유포르비아 트리코나")
                    .size(PlantSize.LARGE)
                    .coins(3L)
                    .lightCondition(LightCondition.DIRECT_LIGHT)
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.DRY)
                    .lightCategory("햇빛이 잘 들어요")
                    .description("유포르비아 트리코나는 삼각기둥 모양의 줄기가 특징인 다육식물입니다. 독특한 외형으로 인기가 높으며, 관리가 매우 쉽습니다.")
                    .images(List.of(
                            "/images/euphorbia-trigona.jpg",
                            "https://images.unsplash.com/photo-1615671524827-c1fe3973b648?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/big/Euphorbia_Trigona.glb")
                    .careGuide(euphorbiaTrigonaCareGuide)
                    .features(List.of("독특한 삼각 형태", "관리 매우 쉬움", "대형 크기", "건조에 강함"))
                    .careTip("      <h3>\uD83D\uDD3A 유포르비아 트리코나란?</h3>\n" +
                            "      <p>유포르비아 트리코나는 삼각기둥 모양의 줄기가 특징인 다육식물로, 독특한 외형으로 인기가 높습니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙이 완전히 마른 후 물을 주세요</p>\n" +
                            "      <p>• 겨울에는 한 달에 한 번 정도만 주세요</p>\n" +
                            "      <p>• 과습은 뿌리 썩음의 원인이 됩니다</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 직사광선을 좋아합니다</p>\n" +
                            "      <p>• 햇빛이 부족하면 웃자라게 됩니다</p>\n" +
                            "      <p>• 남향 창가가 가장 좋습니다</p>\n" +
                            "      \n" +
                            "      <h3>⚠\uFE0F 주의사항</h3>\n" +
                            "      <p>• 줄기를 자르면 흰 수액이 나옵니다</p>\n" +
                            "      <p>• 수액은 독성이 있으니 피부에 닿지 않도록 주의하세요</p>\n" +
                            "      <p>• 어린이나 반려동물이 있는 곳에서는 주의가 필요합니다</p>")
                    .build();

            plantRepository.save(euphorbiaTrigona);

            CareGuide philodendronCareGuide = CareGuide.builder()
                    .watering("흙 표면이 마르면 물을 주세요. 주 1-2회 정도가 적당합니다.")
                    .light("밝은 간접광을 선호합니다. 반음지에서도 잘 자랍니다.")
                    .temperature("18-25°C의 온도가 적당합니다.")
                    .humidity("보통 습도에서 잘 자랍니다. 새순이 나올 때는 습도를 높여주세요.")
                    .fertilizer("성장기에 월 1-2회 액체비료를 주세요.")
                    .tips("새로 나오는 붉은 잎은 건드리지 마세요. 새순이 나올 때는 비료를 주면 좋습니다.")
                    .build();

            Plant philodendron = Plant.builder()
                    .name("필로덴드론 콩고")
                    .size(PlantSize.LARGE)
                    .coins(3L)
                    .lightCondition(LightCondition.SEMI_SHADE)
                    .difficulty(Difficulty.EASY)
                    .humidityTag(Humidity.NORMAL)
                    .lightCategory("햇빛이 잘 들지 않아요")
                    .description("필로덴드론 콩고는 새로 나오는 잎이 붉은색이었다가 점차 녹색으로 변하는 아름다운 관엽식물입니다. 관리가 쉽고 공기정화 효과가 뛰어납니다.")
                    .images(List.of(
                            "/images/philodendron.jpg",
                            "https://images.unsplash.com/photo-1591958911259-bee2173bdccc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                    ))
                    .modelingURL("/models/dynamic/big/Stuckyi.glb")
                    .careGuide(philodendronCareGuide)
                    .features(List.of("붉은 새순", "공기정화 효과", "관리 쉬움", "대형 식물"))
                    .careTip("      <h3>\uD83D\uDD34 필로덴드론 콩고란?</h3>\n" +
                            "      <p>필로덴드론 콩고는 새로 나오는 잎이 붉은색이었다가 점차 녹색으로 변하는 아름다운 관엽식물입니다.</p>\n" +
                            "      \n" +
                            "      <h3>\uD83D\uDCA7 물주기</h3>\n" +
                            "      <p>• 흙 표면이 마르면 물을 주세요</p>\n" +
                            "      <p>• 주 1-2회 정도가 적당합니다</p>\n" +
                            "      <p>• 뿌리가 물에 잠기지 않도록 주의하세요</p>\n" +
                            "      \n" +
                            "      <h3>☀\uFE0F 빛 조건</h3>\n" +
                            "      <p>• 밝은 간접광을 선호합니다</p>\n" +
                            "      <p>• 직사광선은 잎을 태울 수 있습니다</p>\n" +
                            "      <p>• 반음지에서도 잘 자랍니다</p>\n" +
                            "      \n" +
                            "      <h3>\uD83C\uDF31 새순 관리</h3>\n" +
                            "      <p>• 새로 나오는 붉은 잎은 건드리지 마세요</p>\n" +
                            "      <p>• 적절한 습도를 유지해주세요</p>\n" +
                            "      <p>• 새순이 나올 때는 비료를 주면 좋습니다</p>")
                    .build();

            plantRepository.save(philodendron);
        };
    }
}
