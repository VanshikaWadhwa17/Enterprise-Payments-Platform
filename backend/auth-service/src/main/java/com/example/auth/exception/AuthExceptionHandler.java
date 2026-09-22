package com.example.auth.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class AuthExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));
        log.warn("event=RequestError type=VALIDATION fields={}", fieldErrors.keySet());
        return ResponseEntity.badRequest().body(Map.of("message", "Validation failed", "fieldErrors", fieldErrors));
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<Map<String, String>> handlePasswordMismatch(PasswordMismatchException ex) {
        log.warn("event=RequestError type=PASSWORD_MISMATCH");
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailExists(EmailAlreadyExistsException ex) {
        log.warn("event=RequestError type=EMAIL_EXISTS");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException ex) {
        log.warn("event=RequestError type=INVALID_CREDENTIALS");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(SelfModificationException.class)
    public ResponseEntity<Map<String, String>> handleSelfModification(SelfModificationException ex) {
        log.warn("event=RequestError type=SELF_MODIFICATION");
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    // @PreAuthorize denials throw AccessDeniedException (or its subclass
    // AuthorizationDeniedException) from inside the controller method call.
    // Without this handler, the catch-all Exception handler below would
    // catch it first (Spring MVC resolves exception handlers before the
    // exception ever reaches the servlet filter chain) and turn a 403 into
    // a 500. Re-throwing here lets it escape to Spring Security's
    // ExceptionTranslationFilter, which is what actually invokes the
    // accessDeniedHandler configured in SecurityConfig (logs + real 403).
    @ExceptionHandler(AccessDeniedException.class)
    public void rethrowAccessDenied(AccessDeniedException ex) throws AccessDeniedException {
        throw ex;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
        log.error("event=RequestError type=INTERNAL exception={}", ex.toString(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "An unexpected error occurred"));
    }
}
