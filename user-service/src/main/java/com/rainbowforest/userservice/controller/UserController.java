package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private HeaderGenerator headerGenerator;
    
    @GetMapping (value = "/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort){
        
        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort.by(
                sortParts[1].equalsIgnoreCase("desc") ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC,
                sortParts[0]
        );
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sortObj);
        org.springframework.data.domain.Page<User> usersPage = userService.getAllUsersPaginated(pageable);
        
        return new ResponseEntity<>(
                usersPage,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping (value = "/users", params = "name")
    public ResponseEntity<User> getUserByNameWithParam(@RequestParam("name") String userName){
    	User user = userService.getUserByName(userName);
    	if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users/user/{userName}")
    public ResponseEntity<User> getUserByName(@PathVariable("userName") String userName){
    	User user = userService.getUserByName(userName);
    	if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable("email") String email){
        User user = userService.getUserByEmail(email);
        if(user != null) {
            return new ResponseEntity<User>(
                    user,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<User>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id){

        // Lấy thông tin người đang gọi API
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        User user = userService.getUserById(id);
        
        if(user == null) {
            return new ResponseEntity<User>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
        }

        // Kiểm tra quyền: Chỉ cho phép người dùng xem CHÍNH ID của mình (hoặc Admin xem tất cả)
        if (!isAdmin) {
            // Lấy User từ Context bảo mật (được set từ JwtAuthenticationFilter)
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                User currentUser = (User) principal;
                if (!currentUser.getId().equals(id)) {
                    return new ResponseEntity<User>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
                }
            } else {
                // Fallback nếu Principal không phải object User
                if (!user.getUserName().equals(currentPrincipalName)) {
                    return new ResponseEntity<User>(headerGenerator.getHeadersForError(), HttpStatus.FORBIDDEN);
                }
            }
        }

        return new ResponseEntity<User>(
                user,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @PostMapping (value = "/users")
    public ResponseEntity<User> addUser(@RequestBody User user, HttpServletRequest request){
    	if(user != null)
    		try {
    			userService.saveUser(user);
    			return new ResponseEntity<User>(
    					user,
    					headerGenerator.getHeadersForSuccessPostMethod(request, user.getId()),
    					HttpStatus.CREATED);
    		}catch (Exception e) {
    			e.printStackTrace();
    			return new ResponseEntity<User>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
        return new ResponseEntity<User>(HttpStatus.BAD_REQUEST);
    }

    @PutMapping(value = "/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @RequestBody User user, HttpServletRequest request) {
        if(user != null) {
            try {
                User updatedUser = userService.updateUser(id, user);
                if (updatedUser != null) {
                    return new ResponseEntity<User>(
                            updatedUser,
                            headerGenerator.getHeadersForSuccessGetMethod(),
                            HttpStatus.OK);
                }
                return new ResponseEntity<User>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND);
            } catch (RuntimeException e) {
                return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<User>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<User>(HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        try {
            User existingUser = userService.getUserById(id);
            if (existingUser != null) {
                userService.deleteUser(id);
                return new ResponseEntity<Void>(
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            }
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<Void>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
