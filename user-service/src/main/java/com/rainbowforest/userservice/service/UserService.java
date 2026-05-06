package com.rainbowforest.userservice.service;

import java.util.List;

import com.rainbowforest.userservice.entity.User;

public interface UserService {
    List<User> getAllUsers();
    org.springframework.data.domain.Page<User> getAllUsersPaginated(org.springframework.data.domain.Pageable pageable);
    User getUserById(Long id);
    User getUserByName(String userName);
    User getUserByEmail(String email);
    User getUserByPhoneNumber(String phoneNumber);
    User getUserByIdentifier(String identifier);
    User saveUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
    void forgotPassword(String email, String baseUrl);
    void resetPassword(String token, String newPassword);
}
