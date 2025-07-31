package com.rhas.csleaguesolution.service;

import com.rhas.csleaguesolution.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepo;

    @Transactional(readOnly = true)
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            com.rhas.csleaguesolution.entities.User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas"));

            if (user.isDisabled()) {
                throw new DisabledException("Usuario deshabilitado");
            }

            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPasswordHash(),
                    user.getRoles().stream()
                            .map(role -> new SimpleGrantedAuthority(role.getName().toUpperCase()))
                            .collect(Collectors.toSet())
            );
        } catch (DataAccessException e) {
            throw new AuthenticationServiceException("Error al acceder a datos de usuario", e);
        }
    }
}