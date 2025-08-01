package com.rhas.csleaguesolution.repositories;

import com.rhas.csleaguesolution.entities.Competition;
import com.rhas.csleaguesolution.entities.Team;
import com.rhas.csleaguesolution.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    List<Competition> findByTeamsContaining(Team team);
    List<Competition> findAll();
}
