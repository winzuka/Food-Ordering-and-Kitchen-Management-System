package com.foodapp.userservice.dto;

import com.foodapp.userservice.model.User;

public class LoginResponse {
    private String token;
    private User user;

    // Default constructor
    public LoginResponse() {}

    // Parameterized constructor
    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}