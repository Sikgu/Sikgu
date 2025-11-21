package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.CartDto;
import com.sikgu.sikgubackend.dto.CartItemAddRequest;
import com.sikgu.sikgubackend.dto.CartItemDto;
import com.sikgu.sikgubackend.entity.Cart;
import com.sikgu.sikgubackend.entity.CartItem;
import com.sikgu.sikgubackend.entity.Plant;
import com.sikgu.sikgubackend.repository.CartItemRepository;
import com.sikgu.sikgubackend.repository.CartRepository;
import com.sikgu.sikgubackend.repository.PlantRepository;
import com.sikgu.sikgubackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final PlantRepository plantRepository;
    private final CartItemRepository cartItemRepository;

    // 1. 장바구니 정보 조회 (GET /carts)
    @Transactional(readOnly = true)
    public CartDto getShoppingCart(String email) {
        log.debug("SERVICE: Fetching shopping cart for user: {}", email);

        Optional<Cart> optionalCart = cartRepository.findByUserEmail(email);

        Cart cart;
        if (optionalCart.isPresent()) {
            cart = optionalCart.get();
        } else {
            log.debug("CART READ: Cart not found for user {}, attempting creation.", email);
            cart = userRepository.findByEmail(email)
                    .map(user -> Cart.builder().user(user).build())
                    .orElseThrow(() -> {
                        log.warn("CART READ FAILED: User not found with email: {}", email);
                        return new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다: " + email);
                    });
        }

        // Cart 엔티티를 CartDto로 변환 및 총 가격 계산
        List<CartItemDto> itemDtos = cart.getItems().stream()
                .map(item -> {
                    long itemTotal = item.getPlant().getCoins() * item.getQuantity();

                    return new CartItemDto(
                            item.getPlant().getId(),
                            item.getPlant().getName(),
                            item.getPlant().getCoins(),
                            item.getQuantity(),
                            itemTotal
                    );
                })
                .collect(Collectors.toList());

        long totalPrice = itemDtos.stream()
                .mapToLong(CartItemDto::getItemTotal)
                .sum();

        log.info("CART READ SUCCESS: Cart fetched with total price {} for user: {}", totalPrice, email);
        return new CartDto(email, itemDtos, totalPrice);
    }

    // 2. 장바구니 항목 추가 (POST /carts)
    @Transactional
    public CartDto addItemToCart(String email, CartItemAddRequest request) {
        log.info("SERVICE: Adding item {} to cart for user: {}", request.getPlantId(), email);

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    log.debug("CART CREATE: Cart does not exist, creating new cart for user: {}", email);
                    return userRepository.findByEmail(email)
                            .map(user -> cartRepository.save(Cart.builder().user(user).build()))
                            .orElseThrow(() -> {
                                log.warn("CART CREATE FAILED: User not found with email: {}", email);
                                return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
                            });
                });

        Plant plant = plantRepository.findById(request.getPlantId())
                .orElseThrow(() -> {
                    log.warn("ITEM ADD FAILED: Plant ID {} not found.", request.getPlantId());
                    return new IllegalArgumentException("존재하지 않는 식물 ID입니다: " + request.getPlantId());
                });

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getPlant().getId().equals(request.getPlantId()))
                .findFirst();

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // 기존 항목이 있으면 수량을 1만 증가
            cartItem = existingItem.get();
            cartItem.increaseQuantity();
            log.info("ITEM ADD SUCCESS: Increased quantity of plant {} for user {}. New quantity: {}", request.getPlantId(), email, cartItem.getQuantity());
        } else {
            // 새 항목이면 수량을 1로 설정
            cartItem = CartItem.builder()
                    .cart(cart)
                    .plant(plant)
                    .build();
            cart.getItems().add(cartItem);
            log.info("ITEM ADD SUCCESS: Added new plant {} to cart for user {}.", request.getPlantId(), email);
        }

        cartItemRepository.save(cartItem);

        return getShoppingCart(email);
    }

    // 3. 수량 감소 (PATCH /carts/{plantId}/quantity)
    @Transactional
    public CartDto decreaseItemQuantity(String email, Long plantId) {
        log.info("SERVICE: Decreasing quantity of item {} for user: {}", plantId, email);

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> {
                    log.warn("CART UPDATE FAILED: Cart not found for user: {}", email);
                    return new IllegalArgumentException("사용자의 장바구니를 찾을 수 없습니다.");
                });

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getPlant().getId().equals(plantId))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("QUANTITY DECREASE FAILED: Item {} not found in cart for user: {}", plantId, email);
                    return new IllegalArgumentException("장바구니에 해당 식물 항목이 없습니다.");
                });

        if (cartItem.getQuantity() > 1) {
            // 수량이 1보다 크면 1 감소
            cartItem.decreaseQuantity();
            cartItemRepository.save(cartItem);
            log.info("QUANTITY DECREASE SUCCESS: Decreased plant {} quantity to {}.", plantId, cartItem.getQuantity());
        } else {
            // 수량이 1이면 항목 전체 제거
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
            log.info("ITEM REMOVE SUCCESS: Plant {} fully removed (Quantity reached 0).", plantId);
        }

        return getShoppingCart(email);
    }

    // 4. 항목 전체 제거 (DELETE /carts/{plantId})
    @Transactional
    public CartDto removeItemFromCart(String email, Long plantId) {
        log.warn("SERVICE: Full item removal request for item {} from user: {}", plantId, email); // WARN level for DELETE

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> {
                    log.warn("CART ACCESS FAILED: Cart not found for user: {}", email);
                    return new IllegalArgumentException("사용자의 장바구니를 찾을 수 없습니다.");
                });

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getPlant().getId().equals(plantId))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("ITEM REMOVE FAILED: Item {} not found in cart for user: {}", plantId, email);
                    return new IllegalArgumentException("장바구니에 해당 식물 항목이 없습니다.");
                });

        // 항목 제거 및 DB 반영
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        log.info("ITEM REMOVE SUCCESS: Plant {} successfully removed from cart.", plantId);

        return getShoppingCart(email);
    }

    // 5. 장바구니 전체 비우기 (DELETE /carts)
    @Transactional
    public CartDto clearCart(String email) {
        log.warn("SERVICE: Full cart clear request for user: {}", email); // WARN level for full DELETE

        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> {
                    log.warn("CART CLEAR FAILED: Cart not found for user: {}", email);
                    return new IllegalArgumentException("사용자의 장바구니를 찾을 수 없습니다.");
                });

        // 모든 항목 제거 및 DB 반영
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        log.info("CART CLEAR SUCCESS: Cart successfully emptied for user: {}", email);

        return getShoppingCart(email);
    }
}