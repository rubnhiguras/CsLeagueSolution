package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competitions_id", referencedColumnName = "id")
    private Competition competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teams_local_id", referencedColumnName = "id")
    private Team localTeam;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teams_visitant_id", referencedColumnName = "id")
    private Team visitantTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_referee_id", referencedColumnName = "id")
    private User referee;

    private String locationName;
    private Double locationLatitude;
    private Double locationLongitude;

    private LocalDateTime matchDateTime;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "users_team_visitant_match",
        joinColumns = @JoinColumn(name = "match_id"),
        inverseJoinColumns = @JoinColumn(name = "users_id")
    )
    private Set<User> playersVisitant = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "users_team_local_match",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "users_id")
    )
    private Set<User> playersLocal = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "event_match",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "events_id")
    )
    private Set<Event> events = new HashSet<>();


    public boolean addEvent(Event newEvent){
        if (this.events == null){
            this.events = new HashSet<>();
        }
        return this.events.add(newEvent);
    }

    public boolean addPlayerLocal(User newPlayer){
        if (this.playersLocal == null){
            this.playersLocal = new HashSet<>();
        }
        return this.playersLocal.add(newPlayer);
    }

    public boolean addPlayerVisitant(User newPlayer){
        if (this.playersVisitant == null){
            this.playersVisitant = new HashSet<>();
        }
        return this.playersVisitant.add(newPlayer);
    }
}