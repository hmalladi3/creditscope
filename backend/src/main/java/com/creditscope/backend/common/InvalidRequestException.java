package com.creditscope.backend.common;

// @spec API-BE-002, API-BE-007
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
