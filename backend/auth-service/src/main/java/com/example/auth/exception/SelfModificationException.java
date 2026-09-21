package com.example.auth.exception;

public class SelfModificationException extends RuntimeException {

    public SelfModificationException() {
        super("You cannot change your own role or enabled status");
    }
}
