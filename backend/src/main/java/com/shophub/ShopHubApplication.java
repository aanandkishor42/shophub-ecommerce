package com.shophub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ShopHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopHubApplication.class, args);
    }
}