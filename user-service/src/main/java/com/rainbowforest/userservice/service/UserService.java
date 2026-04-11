package com.rainbowforest.userservice.service;

import java.util.List;

import com.rainbowforest.userservice.entity.User;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User getUserByName(String userName);
    User getUserByEmail(String email);
    User saveUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
}
