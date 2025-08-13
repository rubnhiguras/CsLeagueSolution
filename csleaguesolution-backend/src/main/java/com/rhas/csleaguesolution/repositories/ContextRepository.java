package com.rhas.csleaguesolution.repositories;

import com.rhas.csleaguesolution.entities.Context;
import com.rhas.csleaguesolution.entities.Permission;
import com.rhas.csleaguesolution.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContextRepository extends JpaRepository<Context, Long> {
    Optional<Context> findByName(String name);
    Optional<Context> findById(Long id);
    List<Context> findByNameContainingIgnoreCase(String name);
}
