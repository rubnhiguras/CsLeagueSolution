package com.rhas.csleaguesolution.service;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.entities.User;
import com.rhas.csleaguesolution.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    /**
     * Get currently authenticated user
     */
    public DTO.UserResponse getCurrentUser() {
        org.springframework.security.core.userdetails.User currentUser = getCurrentUserPrincipal();
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new OpenApiResourceNotFoundException(currentUser.getUsername()));

        return mapUserToUserResponse(user);
    }

    /**
     * Get all users (for admin purposes)
     */
    public List<DTO.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());
    }



    /**
     * Update user profile
     */
    public DTO.UserResponse updateUser(DTO.UserResponse userResponse) {
        org.springframework.security.core.userdetails.User currentUser = getCurrentUserPrincipal();
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new OpenApiResourceNotFoundException(currentUser.getUsername()));

        user.setName(userResponse.name());
        user.setSurname(userResponse.surname());
        user.setPhone(userResponse.phone());
        user.setAvatarUrl(userResponse.avatarUrl());

        User updatedUser = userRepository.save(user);
        return mapUserToUserResponse(updatedUser);
    }

    /**
     * Helper method to get current authenticated user
     */
    private org.springframework.security.core.userdetails.User getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
    }

    /**
     * Map User entity to UserResponse DTO
     */
    private DTO.UserResponse mapUserToUserResponse(User user) {
        return new DTO.UserResponse(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.isDisabled(),
                user.getRoles().stream().map(role ->
                        new DTO.RoleResponse(
                                role.getId(),
                                role.getName(),
                                new DTO.ContextResponse(role.getContext().getId(), role.getContext().getName(), role.getContext().getDescription()),
                                role.getDescription(),
                                role.getPermisos().stream().map(permission ->
                                        new DTO.PermissionResponse(
                                                permission.getId(),
                                                permission.getName(),
                                                new DTO.ContextResponse(permission.getContext().getId(), permission.getContext().getName(), permission.getContext().getDescription()),
                                                permission.getDescription()
                                        )
                                ).collect(Collectors.toSet())
                        )
                ).collect(Collectors.toSet())
        );
    }
}