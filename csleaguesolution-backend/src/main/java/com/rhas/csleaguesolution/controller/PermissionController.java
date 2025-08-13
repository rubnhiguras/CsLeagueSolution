package com.rhas.csleaguesolution.controller;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.service.PermissionService;
import com.rhas.csleaguesolution.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@CrossOrigin
public class PermissionController {
    private static final Logger logger = LoggerFactory.getLogger(PermissionController.class);

    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<DTO.PermissionDTO> create(@RequestBody DTO.CreatePermissionDTO dto) {
        DTO.PermissionDTO created = permissionService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<DTO.PermissionDTO>> search(@RequestParam String query, @RequestParam String context) {
        List<DTO.PermissionDTO> results = permissionService.searchPermission(query, context);
        return ResponseEntity.ok(results);
    }

//    @GetMapping
//    public ResponseEntity<List<DTO.PermissionDTO>> showAll() {
//        List<DTO.PermissionDTO> results = permissionService.showAll();
//        return ResponseEntity.ok(results);
//    }

}