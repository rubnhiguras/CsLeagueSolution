package com.rhas.csleaguesolution.repositories.initializer;

import com.rhas.csleaguesolution.entities.Context;
import com.rhas.csleaguesolution.repositories.ContextRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.rhas.csleaguesolution.repositories.UserRepository;
import com.rhas.csleaguesolution.repositories.PermissionRepository;
import com.rhas.csleaguesolution.repositories.RoleRepository;
import com.rhas.csleaguesolution.entities.User;
import com.rhas.csleaguesolution.entities.Permission;
import com.rhas.csleaguesolution.entities.Role;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import static com.rhas.csleaguesolution.dto.DTO.*;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final PermissionRepository permisoRepository;
    private final RoleRepository roleRepository;

    private final ContextRepository contextRepository;

    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void initDb() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            logger.info("Init base de datos");

            Context contextAdmin = contextRepository.save(
                    Context.builder()
                            .name(CONTEXT_SYSTEM)
                            .description("Contexto de administración del sistema")
                            .build()
            );

            Permission permisoAdmin = permisoRepository.save(
                    Permission.builder()
                            .name(PERMISSION_FULL_ACCESS)
                            .description("Acceso total")
                            .context(contextAdmin)
                            .build()
            );

            Permission permisoUsuario = permisoRepository.save(
                    Permission.builder()
                            .name(PERMISSION_USER_ACCESS)
                            .description("Acceso solo a datos propios")
                            .context(contextAdmin)
                            .build()
            );

            Role roleAdmin = Role.builder()
                    .name(ROLE_ADMIN_USER)
                    .description("Usuario administrador")
                    .context(contextAdmin)
                    .build();
            roleAdmin.addPermisos(permisoAdmin); // relación añadida
            roleAdmin = roleRepository.save(roleAdmin);
            roleAdmin = roleRepository.findByName(roleAdmin.getName()).orElseThrow();

            User admin = User.builder()
                    .name("Administrador")
                    .surname("Apellido administrador")
                    .phone("+1 (212) 555-1234")
                    .email(adminEmail)
                    .passwordHash(adminPassword)
//                    .avatarUrl("https://e7.pngegg.com/pngimages/713/136/png-clipart-computer-icons-system-administrator-id-computer-network-heroes.png")
                    .disabled(false)
                    .build();
            admin.addRol(roleAdmin); // relación añadida
            userRepository.save(admin);

            logger.info("Init permisos y roles HECHO");
        }
    }
}
