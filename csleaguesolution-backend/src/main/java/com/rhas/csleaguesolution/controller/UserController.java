package com.rhas.csleaguesolution.controller;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<DTO.UserResponse> getCurrentUser() {
        try{
            return ResponseEntity.ok(userService.getCurrentUser());
        } catch (Exception exception){
            logger.error(exception.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @PostMapping("/{id}/permissions")
    public ResponseEntity<Void> saveUserPermissionsTree(
            @PathVariable Long id,
            @RequestBody DTO.UserPermissionsTreeDTO request
    ) {
        try {
            userService.saveUserPermissionsTree(id, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error al guardar permisos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/showCompetitions")
    public ResponseEntity<DTO.UserResponse> getCompetitions() {
        try{
            return ResponseEntity.ok(userService.getCurrentUser());
        } catch (Exception exception){
            logger.error(exception.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }
}