package com.dinecity.auth;

import com.dinecity.user.Role;
import com.dinecity.user.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72, message = "must be between 8 and 72 characters") String password,
            @NotBlank @Size(max = 150) String fullName,
            @NotNull Role role) {
    }

    public record LoginRequest(
            @NotBlank String email,
            @NotBlank String password) {
    }

    public record UserResponse(Long id, String email, String fullName, Role role) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole());
        }
    }

    public record AuthResponse(String token, UserResponse user) {
    }
}
