package com.creditscope.backend.common;

// @spec API-ERR-002
public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}
