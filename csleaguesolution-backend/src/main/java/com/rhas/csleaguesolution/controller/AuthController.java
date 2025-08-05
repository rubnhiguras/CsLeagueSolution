package com.rhas.csleaguesolution.controller;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<DTO.AuthResponse> authenticateUser(@Valid @RequestBody DTO.LoginRequest loginRequest) {
        try{
            return ResponseEntity.ok(authService.login(loginRequest));
        } catch (AuthenticationException authenticationException){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DTO.AuthResponse(authenticationException.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<DTO.AuthResponse> registerUser(@Valid @RequestBody DTO.RegisterRequest registerRequest) {
        try {
            authService.register(registerRequest);
            return authenticateUser(new DTO.LoginRequest(registerRequest.email(), registerRequest.password()));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new DTO.AuthResponse(exception.getMessage()));
        }
    }
}