package com.rhas.csleaguesolution.dto;

import java.util.Set;

public class DTO {

    // Auth DTOs
    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String name, String surname, String phone, String email, String password) {}
    public record AuthResponse(String token) {}

    // Response DTOs
    public record PermissionResponse(Long id, String name, ContextResponse context, String description) {}
    public record RoleResponse(Long id, String name, ContextResponse context, String description, Set<PermissionResponse> permisos) {}
    public record UserResponse(Long id, String name, String surname, String email, String phone, String avatarUrl, boolean disabled, Set<RoleResponse> roles) {}
    public record ContextResponse(Long id, String name, String description) {}

    public static final String ROLE_REGISTERED_USER = "REGISTERED_USER";
    public static final String ROLE_ADMIN_USER = "ROLE_ADMIN";
    public static final String PERMISSION_USER_ACCESS = "USER_ACCESS";
    public static final String PERMISSION_FULL_ACCESS = "FULL_ACCESS";
    public static final String CONTEXT_SYSTEM = "SYSTEM";

}
