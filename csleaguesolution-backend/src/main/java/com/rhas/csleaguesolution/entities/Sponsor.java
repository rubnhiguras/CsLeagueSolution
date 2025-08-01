package com.rhas.csleaguesolution.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sponsors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sponsor {
    @Id @GeneratedValue
    private Long id;

    private String name;
    private boolean disabled;
    private String urlAdRedirect;
    private String urlAd;
    private String description;
    private long totalClicks;
    private String clicksPerWeek; // '_' + num.clicks + '#' + year + week

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sponsor_plan_id", referencedColumnName = "id")
    private SponsorPlan plan;

}