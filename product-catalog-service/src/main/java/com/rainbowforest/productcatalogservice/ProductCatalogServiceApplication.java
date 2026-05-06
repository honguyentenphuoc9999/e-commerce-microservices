package com.rainbowforest.productcatalogservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
@EnableFeignClients
@EnableDiscoveryClient
public class ProductCatalogServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductCatalogServiceApplication.class, args);
    }
}
