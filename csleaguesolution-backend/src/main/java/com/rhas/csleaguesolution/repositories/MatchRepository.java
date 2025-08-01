package com.rhas.csleaguesolution.repositories;

import com.rhas.csleaguesolution.entities.Match;
import com.rhas.csleaguesolution.entities.Team;
import com.rhas.csleaguesolution.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    Optional<Match> findByReferee(User referee);
    List<Match> findAll();
    List<Match> findByPlayersLocalContaining(User player);
    List<Match> findByPlayersVisitantContaining(User player);
    List<Match> findByLocalTeam(Team team);
    List<Match> findByVisitantTeam(Team team);
}
