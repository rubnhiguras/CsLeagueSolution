package com.rhas.csleaguesolution.service;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.entities.Context;
import com.rhas.csleaguesolution.entities.Permission;
import com.rhas.csleaguesolution.entities.Role;
import com.rhas.csleaguesolution.entities.User;
import com.rhas.csleaguesolution.repositories.ContextRepository;
import com.rhas.csleaguesolution.repositories.PermissionRepository;
import com.rhas.csleaguesolution.repositories.RoleRepository;
import com.rhas.csleaguesolution.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.MethodNotAllowedException;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ContextRepository contextRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Value("${app.avatar.upload-dir}")
    private String avatarUploadDir;

    public DTO.UserResponse updateUserAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        // Validar el archivo
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        // Crear directorio si no existe
        File uploadDir = new File(avatarUploadDir);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + fileExtension;
        String relativePath = "http://localhost/api/api/files/avatar/" + newFilename;
        String absolutePath = avatarUploadDir + File.separator + newFilename;

        // Guardar el archivo
        try {
            file.transferTo(new File(absolutePath));
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo", e);
        }

        // Actualizar la base de datos
        user.setAvatarUrl(relativePath);
        userRepository.save(user);

        return mapUserToUserResponse(user);
    }

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
        final boolean hasRequiredPermission = getCurrentUserPrincipal()
                .getAuthorities().stream()
                .anyMatch(grantedAuthority ->
                        (DTO.PERMISSION_FULL_ACCESS.equals(grantedAuthority.getAuthority()) ||
                         DTO.PERMISSION_SHOW_USERS_ACCESS.equals(grantedAuthority.getAuthority()) ||
                         DTO.PERMISSION_EDIT_USERS_ACCESS.equals(grantedAuthority.getAuthority()) ||
                         DTO.PERMISSION_DISABLE_USERS_ACCESS.equals(grantedAuthority.getAuthority())
                        )
                );
        if(!hasRequiredPermission){
            throw new AccessDeniedException("Acceso a datos no permitidos");
        }
        return userRepository.findAll().stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());
    }

    public DTO.UserResponse updateCurrentUser(DTO.UserRequest userRequest) {
        org.springframework.security.core.userdetails.User currentUser = getCurrentUserPrincipal();
        return userRequest.email().equals(currentUser.getUsername()) ?
            updateUser(userRequest) : null;
    }

    /**
     * Update user profile
     */
    public DTO.UserResponse updateUser(DTO.UserRequest userRequest) {
        final boolean hasRequiredPermission = getCurrentUserPrincipal()
                .getAuthorities().stream()
                .anyMatch(grantedAuthority ->
                        (DTO.PERMISSION_FULL_ACCESS.equals(grantedAuthority.getAuthority()) ||
                         DTO.PERMISSION_EDIT_USERS_ACCESS.equals(grantedAuthority.getAuthority())
                        )
                );
        if(!hasRequiredPermission){
            throw new AccessDeniedException("Acceso a datos no permitidos");
        }
        User user = userRepository.findByEmail(userRequest.email())
                .orElseThrow(() -> new OpenApiResourceNotFoundException(userRequest.email()));

        user.setName(userRequest.name());
        user.setSurname(userRequest.surname());
        user.setPhone(userRequest.phone());
        user.setInstagram(userRequest.instagram());
        user.setAvatarUrl(userRequest.avatarUrl());
        user.setDisabled(userRequest.disabled());

        User updatedUser = userRepository.save(user);
        return mapUserToUserResponse(updatedUser);
    }

    @Transactional
    public void saveUserPermissionsTree(Long userId, DTO.UserPermissionsTreeDTO request) {
        // 1. Obtener usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // === RECOGER IDS DE LA REQUEST ===
        Set<Long> requestContextIds = request.contexts().stream()
                .map(DTO.UserPermissionsTreeDTO.ContextDTO::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> requestRoleIds = request.contexts().stream()
                .flatMap(ctx -> ctx.roles().stream())
                .map(DTO.UserPermissionsTreeDTO.RoleDTO::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> requestPermissionIds = request.contexts().stream()
                .flatMap(ctx -> ctx.roles().stream())
                .flatMap(role -> role.permissions().stream())
                .map(DTO.UserPermissionsTreeDTO.PermissionDTO::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // === ELIMINAR RELACIONES NO PRESENTES EN LA REQUEST ===
        // Eliminar roles del usuario que no están en request
        Set<Role> rolesToRemove = user.getRoles().stream()
                .filter(role -> !requestRoleIds.contains(role.getId()))
                .collect(Collectors.toSet());
        rolesToRemove.forEach(user::removeRol);

        // Eliminar permisos de cada rol que no están en request
        for (Role role : roleRepository.findAll()) {
            if (requestRoleIds.contains(role.getId())) {
                Set<Permission> permsToRemove = role.getPermisos().stream()
                        .filter(p -> !requestPermissionIds.contains(p.getId()))
                        .collect(Collectors.toSet());
                permsToRemove.forEach(role::removePermisos);
                roleRepository.save(role);
            }
        }

        // Opcional: Eliminar roles y contextos huérfanos si no están asignados a nadie
//        roleRepository.findAll().forEach(role -> {
//            if (!requestRoleIds.contains(role.getId())) {
//                roleRepository.delete(role);
//            }
//        });
//
//        contextRepository.findAll().forEach(context -> {
//            if (!requestContextIds.contains(context.getId())) {
//                contextRepository.delete(context);
//            }
//        });

        // === PROCESAR Y GUARDAR NUEVOS DATOS ===
        for (DTO.UserPermissionsTreeDTO.ContextDTO ctxDto : request.contexts()) {
            Context context = contextRepository.findById(
                    ctxDto.id() != null ? ctxDto.id() : -1
            ).orElse(
                    contextRepository.findByName(ctxDto.name()).orElse(new Context())
            );
            context.setName(ctxDto.name());
            context.setDescription(ctxDto.description());
            context = contextRepository.save(context);

            for (DTO.UserPermissionsTreeDTO.RoleDTO roleDto : ctxDto.roles()) {
                Role role = roleRepository.findById(
                        roleDto.id() != null ? roleDto.id() : -1
                ).orElse(
                        roleRepository.findByName(roleDto.name()).orElse(new Role())
                );
                role.setName(roleDto.name());
                role.setDescription(roleDto.description());
                role.setContext(context);

                // Sincronizar permisos del rol
                Set<Permission> updatedPerms = new HashSet<>();
                for (DTO.UserPermissionsTreeDTO.PermissionDTO permDto : roleDto.permissions()) {
                    Permission permission = permissionRepository.findById(
                            permDto.id() != null ? permDto.id() : -1
                    ).orElse(
                            permissionRepository.findByName(permDto.name()).orElse(new Permission())
                    );
                    permission.setName(permDto.name());
                    permission.setDescription(permDto.description());
                    permission.setContext(context);
                    permission = permissionRepository.save(permission);
                    updatedPerms.add(permission);
                }

                role.setPermisos(updatedPerms);
                role = roleRepository.save(role);

                // Asignar rol al usuario si no lo tiene
                user.addRol(role);
            }
        }

        userRepository.save(user);

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
                user.getInstagram(),
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