package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp = LocalDateTime.now();

    private Long userId;

    private UUID sessionId;

    private String actionType; // LOGIN, UPDATE, etc.

    private String entityName;

    private Long entityId;

    private String fieldChanged;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;
}
