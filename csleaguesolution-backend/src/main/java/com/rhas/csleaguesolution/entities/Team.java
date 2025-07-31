package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private String largename;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id", referencedColumnName = "id")
    private User capitan;
    private String avatarUrl;
    private boolean disabled;
    // relaciones con roles y permisos

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "users_team",
        joinColumns = @JoinColumn(name = "teams_id"),
        inverseJoinColumns = @JoinColumn(name = "users_id")
    )
    private Set<User> players = new HashSet<>();

    public boolean addPlayer(User newPlayer){
        if (this.players == null){
            this.players = new HashSet<>();
        }
        return this.players.add(newPlayer);
    }
}