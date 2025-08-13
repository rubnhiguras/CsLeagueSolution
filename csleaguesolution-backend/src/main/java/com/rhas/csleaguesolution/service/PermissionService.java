package com.rhas.csleaguesolution.service;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.entities.Context;
import com.rhas.csleaguesolution.entities.Permission;
import com.rhas.csleaguesolution.repositories.ContextRepository;
import com.rhas.csleaguesolution.repositories.PermissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final ContextRepository contextRepository;

    public PermissionService(PermissionRepository permissionRepository, ContextRepository contextRepository) {
        this.permissionRepository = permissionRepository;
        this.contextRepository = contextRepository;
    }

    public DTO.PermissionDTO create(DTO.CreatePermissionDTO dto) {
        if (permissionRepository.findByName(dto.name()).isPresent()) {
            throw new RuntimeException("El permiso ya existe");
        }

        Context context = contextRepository.findById(dto.contextId())
                .orElseThrow(() -> new RuntimeException("Contexto no encontrado"));

        Permission permission = new Permission();
        permission.setName(dto.name());
        permission.setDescription(dto.description());
        permission.setContext(context);

        Permission saved = permissionRepository.save(permission);
        return toDTO(saved);
    }

    public List<DTO.PermissionDTO> searchPermission(String query, String context) {
        return query != null ? permissionRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .filter(permission -> permission.getContext().getName().equals(context))
                .map(this::toDTO)
                .collect(Collectors.toList()) :
                    List.of()
                ;
    }

    public List<DTO.ContextResponse> searchContext(String query) {
        return query != null ? contextRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList()) :
                List.of()
                ;
    }

    public List<DTO.PermissionDTO> showAll() {
        return permissionRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DTO.PermissionDTO toDTO(Permission p) {
        return new DTO.PermissionDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getContext() != null ? p.getContext().getId() : null,
                p.getContext() != null ? p.getContext().getName() : null
        );
    }

    private DTO.ContextResponse toDTO(Context c) {
        return new DTO.ContextResponse(
                c.getId(),
                c.getName(),
                c.getDescription()
        );
    }
}
