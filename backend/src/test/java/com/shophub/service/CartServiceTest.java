package com.shophub.service;

import com.shophub.dto.CartItemRequest;
import com.shophub.dto.CartItemResponse;
import com.shophub.entity.CartItem;
import com.shophub.entity.Product;
import com.shophub.entity.User;
import com.shophub.exception.BadRequestException;
import com.shophub.exception.ResourceNotFoundException;
import com.shophub.repository.CartItemRepository;
import com.shophub.repository.ProductRepository;
import com.shophub.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private CartService cartService;

    private User user() {
        User u = new User();
        u.setUsername("alice");
        return u;
    }

    private Product product() {
        Product p = new Product();
        p.setId(1L);
        p.setName("Headphones");
        p.setPrice(7999.0);
        p.setStock(50);
        return p;
    }

    @Test
    @DisplayName("Adding a brand-new product creates a cart line")
    void addToCart_newItem() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user()));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product()));
        when(cartItemRepository.findByUserAndProductId(any(), eq(1L))).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(2);

        CartItemResponse resp = cartService.addToCart("alice", req);

        assertThat(resp.getProductName()).isEqualTo("Headphones");
        assertThat(resp.getQuantity()).isEqualTo(2);
        assertThat(resp.getTotal()).isEqualTo(15998.0);
    }

    @Test
    @DisplayName("Adding a product already in cart merges the quantity")
    void addToCart_existingItem_mergesQuantity() {
        User u = user();
        Product p = product();
        CartItem existing = new CartItem();
        existing.setUser(u);
        existing.setProduct(p);
        existing.setQuantity(1);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(u));
        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(cartItemRepository.findByUserAndProductId(u, 1L)).thenReturn(Optional.of(existing));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(3);

        CartItemResponse resp = cartService.addToCart("alice", req);

        assertThat(resp.getQuantity()).isEqualTo(4);
    }

    @Test
    @DisplayName("Adding a non-existent product throws 404-style exception")
    void addToCart_missingProduct_throws() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user()));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        CartItemRequest req = new CartItemRequest();
        req.setProductId(999L);
        req.setQuantity(1);

        assertThatThrownBy(() -> cartService.addToCart("alice", req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Product not found");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Zero or negative quantity is rejected before any DB work")
    void addToCart_invalidQuantity_throws() {
        CartItemRequest req = new CartItemRequest();
        req.setProductId(1L);
        req.setQuantity(0);

        assertThatThrownBy(() -> cartService.addToCart("alice", req))
                .isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).findByUsername(any());
        verify(productRepository, never()).findById(any());
        verify(cartItemRepository, never()).save(any());
    }
}