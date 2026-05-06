package com.rainbowforest.userservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rainbowforest.userservice.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserName(String userName);
    User findByUserDetailsEmail(String email);
    User findByUserDetailsPhoneNumber(String phoneNumber);
    
    Page<User> findByRoleRoleName(String roleName, Pageable pageable);
    
    boolean existsByUserName(String userName);
    boolean existsByUserDetailsEmail(String email);
    boolean existsByUserDetailsPhoneNumber(String phoneNumber);
    
    boolean existsByUserNameAndIdNot(String userName, Long id);
    boolean existsByUserDetailsEmailAndIdNot(String email, Long id);
    boolean existsByUserDetailsPhoneNumberAndIdNot(String phoneNumber, Long id);
}
