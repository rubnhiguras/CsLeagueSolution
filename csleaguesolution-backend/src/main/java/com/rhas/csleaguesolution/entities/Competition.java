package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "competitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competition {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private String largename;
    private String avatarUrl;
    private boolean disabled;
    private Timestamp iniDateTime;
    private Timestamp endDateTime;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "teams_competition",
        joinColumns = @JoinColumn(name = "competitions_id"),
        inverseJoinColumns = @JoinColumn(name = "teams_id")
    )
    private Set<Team> teams = new HashSet<>();

    public boolean addTeam(Team team){
        if (this.teams == null){
            this.teams = new HashSet<>();
        }
        return this.teams.add(team);
    }
}