package com.foodapp.userservice.controller;

import com.foodapp.userservice.dto.LoginRequest;
import com.foodapp.userservice.dto.LoginResponse;
import com.foodapp.userservice.dto.ErrorResponse;
import com.foodapp.userservice.model.User;
import com.foodapp.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.authenticateUser(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );

            // Check user status before allowing login
            if ("BLOCKED".equals(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Your account has been blocked. Please contact administrator."));
            }

            if ("SUSPENDED".equals(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Your account has been suspended. Please contact administrator."));
            }

            if ("PENDING".equals(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Your account is pending approval."));
            }

            // Only allow ACTIVE users to login (or users with null status - for backward compatibility)
            if (user.getStatus() != null && !"ACTIVE".equals(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Your account is not active."));
            }

            // For simplicity, we'll use a basic token (you can implement JWT later)
            String token = "simple_token_" + user.getId() + "_" + System.currentTimeMillis();

            LoginResponse response = new LoginResponse(token, user);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User createdUser = userService.registerUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}