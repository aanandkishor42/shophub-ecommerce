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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<CartItemResponse> getCart(String username) {
        User user = getUser(username);
        return cartItemRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(String username, CartItemRequest request) {
        if (request.getQuantity() < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        User user = getUser(username);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CartItem item = cartItemRepository.findByUserAndProductId(user, product.getId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setUser(user);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        item.setQuantity(item.getQuantity() + request.getQuantity());
        cartItemRepository.save(item);
        return toResponse(item);
    }

    @Transactional
    public CartItemResponse updateQuantity(String username, Long productId, int quantity) {
        User user = getUser(username);
        CartItem item = cartItemRepository.findByUserAndProductId(user, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return toResponse(item);
    }

    @Transactional
    public void removeFromCart(String username, Long productId) {
        User user = getUser(username);
        cartItemRepository.findByUserAndProductId(user, productId)
                .ifPresent(cartItemRepository::delete);
    }

    @Transactional
    public void clearCart(String username) {
        User user = getUser(username);
        cartItemRepository.deleteByUser(user);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CartItemResponse toResponse(CartItem item) {
        CartItemResponse resp = new CartItemResponse();
        resp.setId(item.getId());
        resp.setProductId(item.getProduct().getId());
        resp.setProductName(item.getProduct().getName());
        resp.setImageUrl(item.getProduct().getImageUrl());
        resp.setUnitPrice(item.getProduct().getPrice());
        resp.setQuantity(item.getQuantity());
        resp.setTotal(item.getProduct().getPrice() * item.getQuantity());
        return resp;
    }
}
