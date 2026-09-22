package com.example.auth.service;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.SignupRequest;
import com.example.auth.exception.EmailAlreadyExistsException;
import com.example.auth.exception.InvalidCredentialsException;
import com.example.auth.exception.PasswordMismatchException;
import com.example.auth.exception.SelfModificationException;
import com.example.auth.model.AppUser;
import com.example.auth.model.Role;
import com.example.auth.repository.AppUserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUser signup(SignupRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            log.warn("event=Signup status=FAILED reason=PASSWORD_MISMATCH");
            throw new PasswordMismatchException();
        }
        if (appUserRepository.existsByEmailIgnoreCase(request.email())) {
            log.warn("event=Signup status=FAILED reason=EMAIL_EXISTS");
            throw new EmailAlreadyExistsException(request.email());
        }

        AppUser user = new AppUser();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.VIEWER);
        AppUser saved = appUserRepository.save(user);
        log.info("event=Signup status=SUCCESS userId={}", saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public AppUser login(LoginRequest request) {
        AppUser user = appUserRepository
                .findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> {
                    log.warn("event=Login status=FAILED reason=INVALID_CREDENTIALS");
                    return new InvalidCredentialsException();
                });
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("event=Login status=FAILED reason=INVALID_CREDENTIALS userId={}", user.getId());
            throw new InvalidCredentialsException();
        }
        // Deliberately the same generic error as a wrong password -- the API
        // must not leak whether an email belongs to a disabled account. Note
        // this only blocks *new* logins: a JWT already issued before the
        // account was disabled is stateless and stays valid, locally verified
        // by each service, until it expires (app.jwt.expiration-seconds, 8h
        // default). No token revocation/introspection exists in this phase --
        // a deliberate scope boundary, not an oversight.
        if (!user.isEnabled()) {
            log.warn("event=Login status=FAILED reason=ACCOUNT_DISABLED userId={}", user.getId());
            throw new InvalidCredentialsException();
        }
        log.info("event=Login status=SUCCESS userId={}", user.getId());
        return user;
    }

    @Transactional(readOnly = true)
    public AppUser findById(UUID id) {
        return appUserRepository.findById(id).orElseThrow(InvalidCredentialsException::new);
    }

    @Transactional(readOnly = true)
    public List<AppUser> listUsers() {
        return appUserRepository.findAll();
    }

    public AppUser updateRole(UUID id, Role role, UUID callerId) {
        if (id.equals(callerId)) {
            log.warn("event=RoleChange status=DENIED reason=SELF_MODIFICATION actingUserId={}", callerId);
            throw new SelfModificationException();
        }
        AppUser user = findById(id);
        Role previousRole = user.getRole();
        user.setRole(role);
        AppUser saved = appUserRepository.save(user);
        log.info(
                "event=RoleChange status=SUCCESS targetUserId={} from={} to={} actingUserId={}",
                id,
                previousRole,
                role,
                callerId);
        return saved;
    }

    public AppUser updateStatus(UUID id, boolean enabled, UUID callerId) {
        if (id.equals(callerId)) {
            log.warn("event=StatusChange status=DENIED reason=SELF_MODIFICATION actingUserId={}", callerId);
            throw new SelfModificationException();
        }
        AppUser user = findById(id);
        user.setEnabled(enabled);
        AppUser saved = appUserRepository.save(user);
        log.info(
                "event=StatusChange status=SUCCESS targetUserId={} enabled={} actingUserId={}",
                id,
                enabled,
                callerId);
        return saved;
    }
}
