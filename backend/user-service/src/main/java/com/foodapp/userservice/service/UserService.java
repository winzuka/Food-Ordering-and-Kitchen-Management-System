package com.foodapp.userservice.service;

import com.foodapp.userservice.model.User;
import com.foodapp.userservice.model.Role;
import com.foodapp.userservice.repository.UserRepository;
import com.foodapp.userservice.controller.UserController.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;



    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Set default role if not provided
        if (user.getRole() == null) {
            user.setRole(Role.CUSTOMER);
        }

        // Set default status and timestamps
        if (user.getStatus() == null) {
            user.setStatus("ACTIVE");
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Simple password check (in production, use BCrypt or similar)
            if (user.getPassword().equals(password)) {
                return user;
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);

        if (userDetails.getUsername() != null && !userDetails.getUsername().trim().isEmpty()) {
            user.setUsername(userDetails.getUsername());
        }
        if (userDetails.getEmail() != null && !userDetails.getEmail().trim().isEmpty()) {
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getAddress() != null) {
            user.setAddress(userDetails.getAddress());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    /**
     * Get all users - ESSENTIAL for admin panel
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Update user status - ESSENTIAL for block/unblock functionality
     */
    public User updateUserStatus(Long userId, String status) {
        User user = getUserById(userId);

        // Validate status
        if (!Arrays.asList("ACTIVE", "BLOCKED", "SUSPENDED", "PENDING").contains(status)) {
            throw new RuntimeException("Invalid status: " + status);
        }

        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Search users - ESSENTIAL for search functionality
     */
    public List<User> searchUsers(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllUsers();
        }

        String searchTerm = search.toLowerCase().trim();
        return userRepository.findAll().stream()
                .filter(user ->
                        (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchTerm)) ||
                                (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchTerm)) ||
                                (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchTerm)) ||
                                (user.getUsername() != null && user.getUsername().toLowerCase().contains(searchTerm))
                )
                .collect(Collectors.toList());
    }

    /**
     * Filter users by role and status - ESSENTIAL for filtering
     */
    public List<User> getUsersByFilter(String role, String status) {
        List<User> users = getAllUsers();

        return users.stream()
                .filter(user -> {
                    boolean roleMatch = role == null || user.getRole().name().equals(role);
                    boolean statusMatch = status == null ||
                            (user.getStatus() != null && user.getStatus().equals(status)) ||
                            (user.getStatus() == null && "ACTIVE".equals(status));
                    return roleMatch && statusMatch;
                })
                .collect(Collectors.toList());
    }

    /**
     * Check if email exists - ESSENTIAL for validation
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // ==================== OPTIONAL ADMIN METHODS ====================

    /**
     * Create new user - for admin user creation
     */
    public User createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash this
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        // Set role
        if (request.getRole() != null) {
            user.setRole(Role.valueOf(request.getRole()));
        } else {
            user.setRole(Role.CUSTOMER);
        }

        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Update user - for admin user updates
     */
    public User updateUser(Long id, UserUpdateRequest request) {
        User user = getUserById(id);

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhone(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getRole() != null) {
            user.setRole(Role.valueOf(request.getRole()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Update user profile - for user profile updates
     */
    public User updateUserProfile(Long userId, UserProfileUpdateRequest request) {
        User user = getUserById(userId);

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhone(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Delete user - for admin user deletion
     */
    public void deleteUser(Long id) {
        User user = getUserById(id);

        // Safety check - don't allow deleting admin users
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }

        userRepository.delete(user);
    }

    /**
     * Get user statistics - for admin dashboard
     */
    public Map<String, Object> getUserStatistics() {
        List<User> allUsers = getAllUsers();

        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        stats.put("totalUsers", allUsers.size());
        stats.put("activeUsers", allUsers.stream().filter(u -> "ACTIVE".equals(u.getStatus())).count());
        stats.put("blockedUsers", allUsers.stream().filter(u -> "BLOCKED".equals(u.getStatus())).count());
        stats.put("suspendedUsers", allUsers.stream().filter(u -> "SUSPENDED".equals(u.getStatus())).count());
        stats.put("pendingUsers", allUsers.stream().filter(u -> "PENDING".equals(u.getStatus())).count());

        // Role counts
        stats.put("adminUsers", allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count());
        stats.put("customerUsers", allUsers.stream().filter(u -> u.getRole() == Role.CUSTOMER).count());

        // Time-based stats (if you have createdAt field)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);

        stats.put("newUsersThisMonth", allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
                .count());
        stats.put("newUsersToday", allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfDay))
                .count());

        return stats;
    }

    /**
     * Logout user - simple implementation
     */
    public void logoutUser(Long userId) {
        // Simple implementation - just verify user exists
        getUserById(userId);
        // In a real app, you might invalidate JWT tokens here
        System.out.println("User " + userId + " logged out");
    }
}