package com.rhas.csleaguesolution.repositories;

import com.rhas.csleaguesolution.entities.SponsorPlan;
import com.rhas.csleaguesolution.entities.Team;
import com.rhas.csleaguesolution.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SponsorPlanRepository extends JpaRepository<SponsorPlan, Long> {
    Optional<SponsorPlan> findByName(String name);
    List<SponsorPlan> findAll();
}
