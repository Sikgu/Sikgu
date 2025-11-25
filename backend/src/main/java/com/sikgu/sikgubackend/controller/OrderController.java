package com.sikgu.sikgubackend.controller;

import com.sikgu.sikgubackend.dto.response.OrderCreationResponse;
import com.sikgu.sikgubackend.dto.response.OrderHistoryDto;
import com.sikgu.sikgubackend.entity.Order;
import com.sikgu.sikgubackend.service.OrderService;
import com.sikgu.sikgubackend.exception.InsufficientCoinException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "장바구니 전체 항목 코인으로 구매 및 주문 생성")
    @PostMapping("/purchase")
    public ResponseEntity<OrderCreationResponse> purchaseCartWithCoins(@AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        log.info("CONTROLLER: Received purchase request (coins) from user: {}", email);

        try {
            Order newOrder = orderService.purchaseCartWithCoins(email);

            OrderCreationResponse responseDto = new OrderCreationResponse(newOrder);

            // 주문이 성공적으로 생성되었으므로 201 Created
            log.info("CONTROLLER: Order ID {} successfully created for user {}.", newOrder.getId(), email);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (InsufficientCoinException e) {
            // 실패 - 오류 DTO를 생성하여 반환 (success=false, error=Details)
            log.warn("CONTROLLER: Purchase failed due to insufficient coins for user {}.", email);
            OrderCreationResponse errorDto = new OrderCreationResponse(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto);
        } catch (NoSuchElementException | IllegalStateException e) {
            // 실패 - 데이터 문제
            log.error("CONTROLLER: Purchase failed due to Cart/Data issue for user {}: {}", email, e.getMessage());
            OrderCreationResponse errorDto = new OrderCreationResponse(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto);
        }
    }

    @Operation(summary = "사용자 전체 주문 내역 조회")
    @GetMapping
    public ResponseEntity<List<OrderHistoryDto>> getOrderHistory(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        log.info("CONTROLLER: Received order history fetch request from user: {}", email);

        List<OrderHistoryDto> orders = orderService.getOrderHistory(email);

        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "특정 주문 취소 및 코인 환불")
    @DeleteMapping("/{orderId}")
    public ResponseEntity<OrderHistoryDto> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {

        String email = userDetails.getUsername();
        log.warn("CONTROLLER: Received cancellation request for Order ID {} from user: {}", orderId, email);

        Order canceledOrder = orderService.cancelOrder(email, orderId);

        // 취소된 Order 엔티티를 DTO로 변환하여 반환
        OrderHistoryDto responseDto = new OrderHistoryDto(canceledOrder);

        return ResponseEntity.ok(responseDto);
    }
}