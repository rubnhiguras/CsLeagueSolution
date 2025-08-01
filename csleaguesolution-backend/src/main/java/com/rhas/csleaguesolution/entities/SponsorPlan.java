package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sponsor_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SponsorPlan {
    @Id @GeneratedValue
    private Long id;

    private String name;
    private boolean disabled;
    private String description;
    private int weightValue;
    private long totalClicksToEnsure;
    private long totalClicksToEnsurePerWeek;
    private int priceToServe;
    private String currency;

}