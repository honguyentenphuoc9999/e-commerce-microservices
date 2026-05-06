package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import com.rainbowforest.userservice.feignclient.NotificationClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Autowired
    private NotificationClient notificationClient;

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
    public Page<User> getAllUsersPaginated(Pageable pageable) {
        return userRepository.findByRoleRoleName("ROLE_USER", pageable);
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
    public User getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByUserDetailsPhoneNumber(phoneNumber);
    }

    @Override
    public User getUserByIdentifier(String identifier) {
        if (identifier == null) return null;
        
        // Try UserName
        User user = userRepository.findByUserName(identifier);
        if (user != null) return user;
        
        // Try Email
        user = userRepository.findByUserDetailsEmail(identifier);
        if (user != null) return user;
        
        // Try Phone
        user = userRepository.findByUserDetailsPhoneNumber(identifier);
        return user;
    }

    @Override
    public User saveUser(User user) {
        user.setActive(1);
        
        // Manual validation for uniqueness (Aggregated)
        java.util.List<String> duplicates = new java.util.ArrayList<>();
        if (userRepository.existsByUserName(user.getUserName())) {
            duplicates.add("TÊN ĐĂNG NHẬP");
        }
        if (user.getUserDetails() != null) {
            if (userRepository.existsByUserDetailsEmail(user.getUserDetails().getEmail())) {
                duplicates.add("EMAIL");
            }
            if (user.getUserDetails().getPhoneNumber() != null && userRepository.existsByUserDetailsPhoneNumber(user.getUserDetails().getPhoneNumber())) {
                duplicates.add("SỐ ĐIỆN THOẠI");
            }
        }
        if (!duplicates.isEmpty()) {
            throw new RuntimeException(String.join(", ", duplicates) + " ĐÃ ĐƯỢC DÙNG, VUI LÒNG DÙNG THÔNG TIN KHÁC");
        }

        // Hash the password before saving (with validation)
        if (user.getUserPassword() != null) {
            String password = user.getUserPassword();
            // Regex: At least 8 chars, 1 upper, 1 lower, 1 digit, 1 special char
            String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";
            if (!password.matches(regex)) {
                throw new RuntimeException("MẬT KHẨU PHẢI TỐI THIỂU 8 KÝ TỰ, BAO GỒM CHỮ HOA, CHỮ THƯỜNG, SỐ VÀ KÝ TỰ ĐẶC BIỆT (@$!%*?&#)");
            }
            user.setUserPassword(passwordEncoder.encode(password));
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
                String password = user.getUserPassword();
                // Validate if it's a new password (not already hashed)
                // Hashed passwords usually start with $2a$ (BCrypt)
                if (!password.startsWith("$2a$")) {
                    String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";
                    if (!password.matches(regex)) {
                        throw new RuntimeException("MẬT KHẨU PHẢI TỐI THIỂU 8 KÝ TỰ, BAO GỒM CHỮ HOA, CHỮ THƯỜNG, SỐ VÀ KÝ TỰ ĐẶC BIỆT (@$!%*?&#)");
                    }
                    existingUser.setUserPassword(passwordEncoder.encode(password));
                } else {
                    existingUser.setUserPassword(password);
                }
            }
            
            // Nếu trạng thái ACTIVE thay đổi -> Tăng version để HỦY token cũ
            if (existingUser.getActive() != user.getActive()) {
                int oldActive = existingUser.getActive();
                existingUser.setActive(user.getActive());
                existingUser.setTokenVersion(existingUser.getTokenVersion() + 1);

                // Nếu mở khóa tài khoản (0 -> 1)
                if (oldActive == 0 && user.getActive() == 1) {
                    try {
                        java.util.Map<String, Object> req = new java.util.HashMap<>();
                        req.put("userName", existingUser.getUserName());
                        req.put("toEmail", existingUser.getUserDetails() != null ? existingUser.getUserDetails().getEmail() : null);
                        notificationClient.sendAccountRecovery(req);
                    } catch (Exception e) {
                        System.err.println("Failed to send recovery email: " + e.getMessage());
                    }
                }
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

            // Manual validation before saving update (Aggregated)
            java.util.List<String> duplicates = new java.util.ArrayList<>();
            
            // Check Username
            if (user.getUserName() != null && !existingUser.getUserName().equals(user.getUserName()) && 
                userRepository.existsByUserNameAndIdNot(user.getUserName(), id)) {
                duplicates.add("TÊN ĐĂNG NHẬP");
            }

            if (existingUser.getUserDetails() != null) {
                String email = existingUser.getUserDetails().getEmail();
                String phone = existingUser.getUserDetails().getPhoneNumber();
                
                if (email != null && userRepository.existsByUserDetailsEmailAndIdNot(email, id)) {
                    duplicates.add("EMAIL");
                }
                if (phone != null && userRepository.existsByUserDetailsPhoneNumberAndIdNot(phone, id)) {
                    duplicates.add("SỐ ĐIỆN THOẠI");
                }
            }

            if (!duplicates.isEmpty()) {
                throw new RuntimeException(String.join(", ", duplicates) + " ĐÃ ĐƯỢC DÙNG, VUI LÒNG DÙNG THÔNG TIN KHÁC");
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

    @Override
    public void forgotPassword(String email, String baseUrl) {
        User user = userRepository.findByUserDetailsEmail(email);
        if (user != null) {
            String token = java.util.UUID.randomUUID().toString();
            // Store token in Redis for 15 minutes
            redisTemplate.opsForValue().set("reset_token:" + token, user.getUserName(), 15, java.util.concurrent.TimeUnit.MINUTES);
            
            java.util.Map<String, Object> req = new java.util.HashMap<>();
            req.put("userName", user.getUserName());
            req.put("toEmail", email);
            req.put("resetToken", token);
            req.put("frontendUrl", baseUrl); // Pass the dynamic URL
            notificationClient.sendForgotPassword(req);
        } else {
            throw new RuntimeException("KHÔNG TÌM THẤY NGƯỜI DÙNG VỚI EMAIL NÀY");
        }
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        String userName = redisTemplate.opsForValue().get("reset_token:" + token);
        if (userName == null) {
            throw new RuntimeException("MÃ XÁC NHẬN KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN");
        }
        
        User user = userRepository.findByUserName(userName);
        if (user != null) {
            // Regex: At least 8 chars, 1 upper, 1 lower, 1 digit, 1 special char
            String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$";
            if (!newPassword.matches(regex)) {
                throw new RuntimeException("MẬT KHẨU PHẢI TỐI THIỂU 8 KÝ TỰ, BAO GỒM CHỮ HOA, CHỮ THƯỜNG, SỐ VÀ KÝ TỰ ĐẶC BIỆT (@$!%*?&#)");
            }
            
            user.setUserPassword(passwordEncoder.encode(newPassword));
            user.setTokenVersion(user.getTokenVersion() + 1); // Hủy các token hiện tại
            userRepository.save(user);
            redisTemplate.delete("reset_token:" + token);
            syncUserStatusToRedis(user);
        }
    }
}
