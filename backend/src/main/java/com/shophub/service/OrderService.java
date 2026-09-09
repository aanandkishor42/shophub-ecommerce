package com.shophub.service;

import com.shophub.dto.OrderRequest;
import com.shophub.dto.OrderResponse;
import com.shophub.entity.CartItem;
import com.shophub.entity.Order;
import com.shophub.entity.OrderItem;
import com.shophub.entity.Product;
import com.shophub.entity.User;
import com.shophub.exception.BadRequestException;
import com.shophub.exception.ResourceNotFoundException;
import com.shophub.repository.CartItemRepository;
import com.shophub.repository.OrderRepository;
import com.shophub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse placeOrder(String username, OrderRequest request) {
        User user = getUser(username);
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus("PLACED");

        double total = 0;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (cartItem.getQuantity() > product.getStock()) {
                throw new BadRequestException(
                        "Insufficient stock for " + product.getName() + ". Available: " + product.getStock());
            }
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            order.getItems().add(orderItem);
            total += product.getPrice() * cartItem.getQuantity();

            product.setStock(product.getStock() - cartItem.getQuantity());
            if (product.getStock() <= 0) {
                product.setInStock(false);
            }
        }

        order.setTotalAmount(Math.round(total * 100.0) / 100.0);
        orderRepository.save(order);
        cartItemRepository.deleteByUser(user);

        return toResponse(order);
    }

    public List<OrderResponse> getUserOrders(String username) {
        User user = getUser(username);
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse resp = new OrderResponse();
        resp.setId(order.getId());
        resp.setCreatedAt(order.getCreatedAt());
        resp.setTotalAmount(order.getTotalAmount());
        resp.setStatus(order.getStatus());
        resp.setShippingAddress(order.getShippingAddress());

        var items = order.getItems().stream().map(item -> {
            OrderResponse.OrderItemResponse ir = new OrderResponse.OrderItemResponse();
            ir.setProductId(item.getProduct().getId());
            ir.setProductName(item.getProduct().getName());
            ir.setImageUrl(item.getProduct().getImageUrl());
            ir.setQuantity(item.getQuantity());
            ir.setPrice(item.getPrice());
            return ir;
        }).collect(Collectors.toList());

        resp.setItems(items);
        return resp;
    }
}
