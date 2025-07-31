package com.rhas.csleaguesolution.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contexts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Context {
    @Id @GeneratedValue
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    private String description;// Ej: IT, Deportes
}
