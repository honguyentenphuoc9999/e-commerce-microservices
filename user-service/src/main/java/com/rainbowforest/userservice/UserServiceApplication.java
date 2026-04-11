package com.rainbowforest.userservice;

import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner loadData(UserRoleRepository userRoleRepository) {
        return args -> {
            if (userRoleRepository.findUserRoleByRoleName("ROLE_USER") == null) {
                UserRole roleUser = new UserRole();
                roleUser.setRoleName("ROLE_USER");
                userRoleRepository.save(roleUser);
            }
            if (userRoleRepository.findUserRoleByRoleName("ROLE_ADMIN") == null) {
                UserRole roleAdmin = new UserRole();
                roleAdmin.setRoleName("ROLE_ADMIN");
                userRoleRepository.save(roleAdmin);
            }
        };
    }
}
