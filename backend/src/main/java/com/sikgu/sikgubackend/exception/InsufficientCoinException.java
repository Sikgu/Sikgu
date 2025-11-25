package com.sikgu.sikgubackend.exception;

public class InsufficientCoinException extends RuntimeException {

    public InsufficientCoinException(String message) {
        super(message);
    }
}