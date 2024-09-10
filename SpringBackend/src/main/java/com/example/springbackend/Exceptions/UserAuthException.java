package com.example.springbackend.Exceptions;

public class UserAuthException extends Exception{
    public UserAuthException(String message) {
        super(message);
    }
}
