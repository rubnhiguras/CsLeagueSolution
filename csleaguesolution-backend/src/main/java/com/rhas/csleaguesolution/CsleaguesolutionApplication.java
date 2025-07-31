package com.rhas.csleaguesolution;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class CsleaguesolutionApplication {
    public static void main(String[] args) {
        log.info("🚀 Iniciando User csleaguesolution App...");
        SpringApplication.run(com.rhas.csleaguesolution.CsleaguesolutionApplication.class, args);
    }
}
