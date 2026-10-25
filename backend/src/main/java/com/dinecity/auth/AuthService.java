package com.dinecity.auth;

import com.dinecity.auth.AuthDtos.AuthResponse;
import com.dinecity.auth.AuthDtos.LoginRequest;
import com.dinecity.auth.AuthDtos.RegisterRequest;
import com.dinecity.auth.AuthDtos.UserResponse;
import com.dinecity.user.Role;
import com.dinecity.user.User;
import com.dinecity.user.UserRepository;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // Anyone may sign up as a customer or a business owner; admins are never created through the API.
        if (req.role() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be CUSTOMER or OWNER");
        }
        String email = normalize(req.email());
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = users.save(new User(email, passwordEncoder.encode(req.password()), req.fullName().trim(), req.role()));
        return new AuthResponse(jwtService.issue(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(normalize(req.email()))
                .filter(User::isEnabled)
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return new AuthResponse(jwtService.issue(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return users.findById(userId)
                .filter(User::isEnabled)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
