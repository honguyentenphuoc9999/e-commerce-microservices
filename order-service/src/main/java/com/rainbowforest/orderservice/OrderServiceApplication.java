package com.rainbowforest.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.rainbowforest.orderservice.repository.PaymentConfigRepository;
import com.rainbowforest.orderservice.domain.PaymentConfig;

@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaRepositories
@EnableFeignClients
@EnableWebSecurity
@EnableRedisHttpSession
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner seedPaymentConfig(PaymentConfigRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                PaymentConfig config = new PaymentConfig();
                config.setBankId("VIB");
                config.setAccountNo("111111111");
                config.setAccountName("NGUYEN KHAC PHUOC");
                config.setTemplate("compact2");
                config.setActive(true);
                repository.save(config);
                System.out.println("DEBUG: Seeded initial PaymentConfig (VIB)");
            }
        };
    }
}
