package com.rhas.csleaguesolution.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;

    private final long expirationMs = 86400000; // 1 día

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody().getSubject();
    }

    public boolean isValid(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(extractUsername(token)) &&
                !isExpired(token);
    }

    private boolean isExpired(String token) {
        return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody().getExpiration().before(new Date());
    }
}
