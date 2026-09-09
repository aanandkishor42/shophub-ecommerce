package com.shophub.service;

import com.shophub.dto.ProductResponse;
import com.shophub.entity.Product;
import com.shophub.exception.ResourceNotFoundException;
import com.shophub.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductResponse> getProducts(String category, String search, Pageable pageable) {
        Page<Product> products;
        if (search != null && !search.isBlank()) {
            products = searchProducts(search, pageable);
        } else if (category != null && !category.isBlank()) {
            products = getByCategory(category, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(this::toResponse);
    }

    private Page<Product> searchProducts(String search, Pageable pageable) {
        var products = productRepository.findAll(pageable).getContent().stream()
                .filter(p -> p.getName().toLowerCase().contains(search.toLowerCase())
                        || (p.getCategory() != null && p.getCategory().toLowerCase().contains(search.toLowerCase()))
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(search.toLowerCase())))
                .toList();
        return new PageImpl<>(products, pageable, products.size());
    }

    private Page<Product> getByCategory(String category, Pageable pageable) {
        var products = productRepository.findAll(pageable).getContent().stream()
                .filter(p -> category.equalsIgnoreCase(p.getCategory()))
                .toList();
        return new PageImpl<>(products, pageable, products.size());
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    public ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice(),
                p.getCategory(), p.getImageUrl(), p.getStock(), p.isInStock());
    }
}
