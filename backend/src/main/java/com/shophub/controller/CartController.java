package com.shophub.controller;

import com.shophub.dto.CartItemRequest;
import com.shophub.dto.CartItemResponse;
import com.shophub.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @GetMapping
    public List<CartItemResponse> getCart() {
        return cartService.getCart(currentUsername());
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@Valid @RequestBody CartItemRequest request) {
        CartItemResponse item = cartService.addToCart(currentUsername(), request);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long productId, @RequestBody Map<String, Integer> body) {
        int quantity = body.getOrDefault("quantity", 1);
        CartItemResponse item = cartService.updateQuantity(currentUsername(), productId, quantity);
        if (item == null) {
            return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
        }
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId) {
        cartService.removeFromCart(currentUsername(), productId);
        return ResponseEntity.ok(Map.of("message", "Item removed"));
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        cartService.clearCart(currentUsername());
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}
