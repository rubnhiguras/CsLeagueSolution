package com.rhas.csleaguesolution.service;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.entities.Context;
import com.rhas.csleaguesolution.entities.Permission;
import com.rhas.csleaguesolution.entities.User;
import com.rhas.csleaguesolution.entities.Role;
import com.rhas.csleaguesolution.repositories.ContextRepository;
import com.rhas.csleaguesolution.repositories.PermissionRepository;
import com.rhas.csleaguesolution.repositories.RoleRepository;
import com.rhas.csleaguesolution.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static com.rhas.csleaguesolution.dto.DTO.*;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PermissionRepository permissionRepo;
    private final ContextRepository contextRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public DTO.AuthResponse login(DTO.LoginRequest request) throws AuthenticationException{
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        return new DTO.AuthResponse(jwtService.generateToken((UserDetails) auth.getPrincipal()));
    }

    @Transactional
    public void register(DTO.RegisterRequest request) {
        // Validación temprana
        validateEmailNotExists(request.email());

        // Obtener o crear entidades necesarias
        Context systemContext = getOrCreateSystemContext();
        Role defaultRole = getOrCreateDefaultRole(systemContext);

        // Crear y guardar usuario
        createAndSaveUser(request, defaultRole);
    }

    private void validateEmailNotExists(String email) {
        userRepo.findByEmail(email).ifPresent(u -> {
            throw new IllegalArgumentException("El email ya está registrado");
        });
    }

    private Context getOrCreateSystemContext() {
        return contextRepository.findByName(CONTEXT_SYSTEM)
                .orElseGet(() -> contextRepository.save(
                        Context.builder()
                                .name(CONTEXT_SYSTEM)
                                .description("Contexto de administración del sistema")
                                .build()
                ));
    }

    private Role getOrCreateDefaultRole(Context systemContext) {
        Role role = roleRepo.findByName(ROLE_REGISTERED_USER)
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .name(ROLE_REGISTERED_USER)
                            .description("Usuario registrado a través de la API")
                            .context(systemContext)
                            .build();

                    // Asignar permiso
                    Permission permission = getOrCreateUserPermission(systemContext);
                    newRole.addPermisos(permission);

                    return roleRepo.save(newRole);
                });

        return role;
    }

    private Permission getOrCreateUserPermission(Context systemContext) {
        return permissionRepo.findByName(PERMISSION_USER_ACCESS)
                .orElseGet(() -> permissionRepo.save(
                        Permission.builder()
                                .name(PERMISSION_USER_ACCESS)
                                .description("Acceso solo a datos propios")
                                .context(systemContext)
                                .build()
                ));
    }

    private void createAndSaveUser(DTO.RegisterRequest request, Role defaultRole) {
        User user = User.builder()
                .name(request.name())
                .surname(request.surname())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .roles(Set.of(defaultRole))
                .disabled(false)
                .build();

        userRepo.save(user);
    }

}