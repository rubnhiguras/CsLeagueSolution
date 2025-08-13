package com.rhas.csleaguesolution.controller;

import com.rhas.csleaguesolution.dto.DTO;
import com.rhas.csleaguesolution.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contexts")
@RequiredArgsConstructor
@CrossOrigin
public class ContextController {
    private static final Logger logger = LoggerFactory.getLogger(ContextController.class);

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<DTO.ContextResponse>> search(@RequestParam String query) {
        List<DTO.ContextResponse> results = permissionService.searchContext(query);
        return ResponseEntity.ok(results);
    }


}