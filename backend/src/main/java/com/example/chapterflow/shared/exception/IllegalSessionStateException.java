package com.example.chapterflow.shared.exception;

public class IllegalSessionStateException extends RuntimeException {
    public IllegalSessionStateException(String message) {
        super(message);
    }
}
