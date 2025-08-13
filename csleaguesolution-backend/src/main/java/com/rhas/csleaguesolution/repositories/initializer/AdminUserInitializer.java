package com.rhas.csleaguesolution.repositories.initializer;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.dto.DTOCsLeague;
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
    public void initDB(){
        logger.info("Init base de datos");
        initContextAdminDb();
        initContextCSLeagueDb();
        logger.info("Init base de datos, permisos y roles DONE");
    }

    @Transactional
    public void initContextCSLeagueDb(){
        //TODO: Inicializar contexto de la CSLeague
        if(contextRepository.findByName(DTOCsLeague.CONTEXT_SYSTEM).isEmpty()) {
            Context contextCSLeague = contextRepository.save(
                    Context.builder()
                            .name(DTOCsLeague.CONTEXT_SYSTEM)
                            .description("Contexto de administración de la CSLeague")
                            .build()
            );


            Permission permisoCreateChamps = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_CREATE_COMPETITION)
                            .description("Acceso a la creación de competiciones")
                            .context(contextCSLeague)
                            .build()
            );

            Permission permisoEditChamps = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_EDIT_COMPETITION)
                            .description("Acceso a la modificación de competiciones")
                            .context(contextCSLeague)
                            .build()
            );

            Permission permisoCreateMatch = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_CREATE_MATCH)
                            .description("Acceso a la creación de partidos")
                            .context(contextCSLeague)
                            .build()
            );

            Permission permisoEditMatch = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_EDIT_MATCH)
                            .description("Acceso a la modificación de partidos")
                            .context(contextCSLeague)
                            .build()
            );

            Permission permisoEditMatchStats = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_EDIT_MATCH_STATS)
                            .description("Acceso a las modificaciones de estadísticas de partidos.")
                            .context(contextCSLeague)
                            .build()
            );

            Permission permisoCreationNews = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_CREATE_NEWS)
                            .description("Acceso a la creación de noticias.")
                            .context(contextCSLeague)
                            .build()
            );

            Permission permisoEditNews = permisoRepository.save(
                    Permission.builder()
                            .name(DTOCsLeague.PERMISSION_EDIT_NEWS)
                            .description("Acceso a las modificaciones de noticias.")
                            .context(contextCSLeague)
                            .build()
            );
        }
    }

    @Transactional
    public void initContextAdminDb() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {


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

            Permission permisoRoles = permisoRepository.save(
                    Permission.builder()
                            .name(PERMISSION_TREE_ROLES_ACCESS)
                            .description("Acceso al arbol de permisos y roles de los usuarios")
                            .context(contextAdmin)
                            .build()
            );

            Permission permisoVerUsuarios = permisoRepository.save(
                    Permission.builder()
                            .name(PERMISSION_SHOW_USERS_ACCESS)
                            .description("Acceso los datos de los usuarios")
                            .context(contextAdmin)
                            .build()
            );

            Permission permisoDeshabilitarUsuarios = permisoRepository.save(
                    Permission.builder()
                            .name(PERMISSION_DISABLE_USERS_ACCESS)
                            .description("Acceso a los datos de los usuarios y deshabilitarlos")
                            .context(contextAdmin)
                            .build()
            );

            Permission permisoEditarUsuarios = permisoRepository.save(
                    Permission.builder()
                            .name(PERMISSION_EDIT_USERS_ACCESS)
                            .description("Acceso a la edición de datos de los usuarios")
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

        }
    }
}
