package com.example.auth.service;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.SignupRequest;
import com.example.auth.exception.EmailAlreadyExistsException;
import com.example.auth.exception.InvalidCredentialsException;
import com.example.auth.exception.PasswordMismatchException;
import com.example.auth.model.AppUser;
import com.example.auth.model.Role;
import com.example.auth.repository.AppUserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUser signup(SignupRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new PasswordMismatchException();
        }
        if (appUserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        AppUser user = new AppUser();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.VIEWER);
        return appUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AppUser login(LoginRequest request) {
        AppUser user = appUserRepository
                .findByEmailIgnoreCase(request.email())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return user;
    }

    @Transactional(readOnly = true)
    public AppUser findById(UUID id) {
        return appUserRepository.findById(id).orElseThrow(InvalidCredentialsException::new);
    }
}
