package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    @Id @GeneratedValue
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "context_id", referencedColumnName = "id")
    private Context context; // Ej: IT, Deportes
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rol_permiso",
        joinColumns = @JoinColumn(name = "roles_id"),
        inverseJoinColumns = @JoinColumn(name = "permissions_id")
    )
    private Set<Permission> permisos = new HashSet<>();

    public boolean addPermisos(Permission newPermission){
        if (this.permisos == null){
            this.permisos = new HashSet<>();
        }
        return this.permisos.add(newPermission);
    }

    public boolean removePermisos(Permission removePermission){
        if (this.permisos == null){
            this.permisos = new HashSet<>();
        }
        return this.permisos.remove(removePermission);
    }
}
