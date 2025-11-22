package com.sikgu.sikgubackend.service;

import com.sikgu.sikgubackend.dto.response.OrderHistoryDto;
import com.sikgu.sikgubackend.entity.*;
import com.sikgu.sikgubackend.entity.enums.OrderStatus;
import com.sikgu.sikgubackend.exception.InsufficientCoinException;
import com.sikgu.sikgubackend.repository.OrderRepository;
import com.sikgu.sikgubackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final UserRepository userRepository;
    private final CartService cartService;
    private final CoinService coinService;
    private final OrderRepository orderRepository;

    public Order purchaseCartWithCoins(String email) {
        log.info("ORDER FLOW: Starting new purchase transaction for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("ORDER FAILED: User not found with email: {}", email);
                    return new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다: " + email);
                });

        Cart cart = cartService.getCartEntityByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("장바구니를 찾을 수 없습니다."));

        long totalCost = cartService.calculateTotalCost(email);

        if (totalCost == 0) {
            log.warn("ORDER FAILED: Cart is empty or total cost is zero for user: {}", email);
            throw new IllegalStateException("구매할 상품이 없거나 총 가격이 0입니다.");
        }

        // 코인 차감
        try {
            coinService.subtractCoins(email, totalCost);
            log.info("ORDER DEDUCTION SUCCESS: {} coins deducted for purchase.", totalCost);

            Order newOrder = createOrderAndItems(user, cart, totalCost);

            cartService.clearCart(email);

            log.info("ORDER SUCCESS: Purchase completed and Order created for user: {}", email);
            return newOrder;

        } catch (InsufficientCoinException e) { // 코인 부족
            log.warn("ORDER FAILED: Insufficient coins for user {}. Cost: {}", email, totalCost);
            throw e;
        }
    }

    private Order createOrderAndItems(User user, Cart cart, long totalCost) {

        Order order = Order.builder()
                .user(user)
                .totalAmount(totalCost)
                .status(OrderStatus.PENDING)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .plant(cartItem.getPlant())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(cartItem.getPlant().getCoins())
                    .build();

            order.addOrderItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        log.info("ORDER ENTITY CREATED: New Order ID {} created with {} items.", savedOrder.getId(), order.getItems().size());
        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<OrderHistoryDto> getOrderHistory(String email) {
        log.info("SERVICE: Fetching optimized order history for user: {}", email);

        List<Order> orders = orderRepository.findByUserEmail(email);

        if (orders.isEmpty()) {
            log.info("ORDER HISTORY: No orders found for user: {}", email);
        }

        return orders.stream()
                .map(OrderHistoryDto::new)
                .collect(Collectors.toList());
    }
}