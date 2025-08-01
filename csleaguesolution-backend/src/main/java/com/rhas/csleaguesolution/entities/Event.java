package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id @GeneratedValue
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_player_id", referencedColumnName = "id")
    private User playerInvolved;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_referee_id", referencedColumnName = "id")
    private User refereeInvolved;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matches_id", referencedColumnName = "id")
    private Match matchOccur;

    private Boolean yellowCard;
    private Boolean redCard;
    private Boolean foul;
    private Boolean penalty;
    private Boolean goal;

    private String description;

}