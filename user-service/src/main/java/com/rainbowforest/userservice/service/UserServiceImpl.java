package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private void syncUserStatusToRedis(User user) {
        if (user != null && user.getUserName() != null) {
            String key = "user:status:" + user.getUserName();
            String value = user.getActive() + ":" + user.getTokenVersion();
            redisTemplate.opsForValue().set(key, value);
        }
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByUserDetailsEmail(email);
    }

    @Override
    public User saveUser(User user) {
        user.setActive(1);
        
        // Hash the password before saving
        if (user.getUserPassword() != null) {
            user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        }

        // If a role was passed in the JSON payload, use it (e.g., {"role": {"id": 1}})
        if (user.getRole() != null && user.getRole().getId() != null) {
            UserRole customRole = userRoleRepository.findById(user.getRole().getId()).orElse(null);
            if (customRole != null) {
                user.setRole(customRole);
            } else {
                // Fallback to ROLE_USER if ID is invalid
                user.setRole(userRoleRepository.findUserRoleByRoleName("ROLE_USER"));
            }
        } else {
            // Default behavior: assign ROLE_USER
            user.setRole(userRoleRepository.findUserRoleByRoleName("ROLE_USER"));
        }
        
        User savedUser = userRepository.save(user);
        syncUserStatusToRedis(savedUser);
        return savedUser;
    }

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            // Update userName if provided
            if (user.getUserName() != null) {
                existingUser.setUserName(user.getUserName());
            }
            if (user.getUserPassword() != null) {
                existingUser.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
            }
            
            // Nếu trạng thái ACTIVE thay đổi -> Tăng version để HỦY token cũ
            if (existingUser.getActive() != user.getActive()) {
                existingUser.setActive(user.getActive());
                existingUser.setTokenVersion(existingUser.getTokenVersion() + 1);
            }
            
            // Safely update UserDetails fields without breaking JPA references
            if (user.getUserDetails() != null) {
                if (existingUser.getUserDetails() == null) {
                    existingUser.setUserDetails(user.getUserDetails());
                } else {
                    if (user.getUserDetails().getFirstName() != null)
                        existingUser.getUserDetails().setFirstName(user.getUserDetails().getFirstName());
                    if (user.getUserDetails().getLastName() != null)
                        existingUser.getUserDetails().setLastName(user.getUserDetails().getLastName());
                    if (user.getUserDetails().getEmail() != null)
                        existingUser.getUserDetails().setEmail(user.getUserDetails().getEmail());
                    if (user.getUserDetails().getPhoneNumber() != null)
                        existingUser.getUserDetails().setPhoneNumber(user.getUserDetails().getPhoneNumber());
                    if (user.getUserDetails().getStreet() != null)
                        existingUser.getUserDetails().setStreet(user.getUserDetails().getStreet());
                    if (user.getUserDetails().getStreetNumber() != null)
                        existingUser.getUserDetails().setStreetNumber(user.getUserDetails().getStreetNumber());

                    if (user.getUserDetails().getLocality() != null)
                        existingUser.getUserDetails().setLocality(user.getUserDetails().getLocality());
                    if (user.getUserDetails().getCountry() != null)
                        existingUser.getUserDetails().setCountry(user.getUserDetails().getCountry());
                    if (user.getUserDetails().getWard() != null)
                        existingUser.getUserDetails().setWard(user.getUserDetails().getWard());
                    if (user.getUserDetails().getDistrict() != null)
                        existingUser.getUserDetails().setDistrict(user.getUserDetails().getDistrict());
                }
            }
            if (user.getRole() != null) {
                UserRole customRole = userRoleRepository.findById(user.getRole().getId()).orElse(null);
                if (customRole != null) {
                    existingUser.setRole(customRole);
                }
            }


            User updated = userRepository.save(existingUser);
            
            // Đảm bảo thông tin Role được nạp đầy đủ (ID và Name) trước khi trả về
            if (updated.getRole() != null && updated.getRole().getRoleName() == null) {
                UserRole fullRole = userRoleRepository.findById(updated.getRole().getId()).orElse(null);
                updated.setRole(fullRole);
            }
            
            syncUserStatusToRedis(updated);
            return updated;
        }
        return null;
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
