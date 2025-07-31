package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
    @Id @GeneratedValue
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "context_id", referencedColumnName = "id")
    private Context context; // Ej: IT, Deportes
    private String description;
}
