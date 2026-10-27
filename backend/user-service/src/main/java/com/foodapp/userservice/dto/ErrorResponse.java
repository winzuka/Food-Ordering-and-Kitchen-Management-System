package com.foodapp.userservice.dto;

public class ErrorResponse {
    private String message;

    // Default constructor
    public ErrorResponse() {}

    // Parameterized constructor
    public ErrorResponse(String message) {
        this.message = message;
    }

    // Getter and Setter
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}