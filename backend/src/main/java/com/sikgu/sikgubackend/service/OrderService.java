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

    /**
     * 주문을 취소하고 사용자에게 코인을 환불합니다.
     * @param email 취소를 요청한 사용자 이메일 (소유권 검증용)
     * @param orderId 취소할 주문 ID
     * @return 취소된 Order 엔티티
     */
    @Transactional
    public Order cancelOrder(String email, Long orderId) {
        log.warn("ORDER CANCELLATION: Starting cancellation for Order ID {} by user {}", orderId, email);

        // 주문 조회 및 소유권 확인
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("주문 ID " + orderId + "를 찾을 수 없습니다."));

        // 소유권 검증
        if (!order.getUser().getEmail().equals(email)) {
            log.error("ORDER CANCELLATION FAILED: Access denied for Order ID {} by user {}", orderId, email);
            // 비즈니스 로직에서 소유권이 없을 경우 403 Forbidden을 유발할 수 있는 예외를 던짐
            throw new IllegalArgumentException("요청하신 주문에 대한 접근 권한이 없습니다.");
        }

        // 주문 상태 확인 (취소 가능 상태인지 검증)
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("ORDER CANCELLATION FAILED: Order ID {} status is {} and cannot be canceled.", orderId, order.getStatus());
            throw new IllegalStateException("주문은 " + OrderStatus.PENDING + " 상태일 때만 취소 가능합니다. 현재 상태: " + order.getStatus());
        }

        // 코인 환불
        Long refundAmount = order.getTotalAmount();
        coinService.addCoins(email, refundAmount);
        log.info("ORDER REFUND SUCCESS: {} coins refunded to user {}.", refundAmount, email);

        // 상태 변경 및 DB 저장
        order.updateStatus(OrderStatus.CANCELED);
        Order canceledOrder = orderRepository.save(order);

        log.warn("ORDER CANCELLATION SUCCESS: Order ID {} successfully CANCELED.", orderId);
        return canceledOrder;
    }
}