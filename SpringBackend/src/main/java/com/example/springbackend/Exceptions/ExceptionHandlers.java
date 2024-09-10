package com.example.springbackend.Exceptions;

import com.example.springbackend.DTOs.ServerErrorDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.rmi.ServerException;

@ControllerAdvice
public class ExceptionHandlers {

    @ExceptionHandler(UserAuthException.class)
    public ResponseEntity<ServerErrorDTO> handleAuthExceptions(UserAuthException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ServerErrorDTO(e.getMessage(), "NO_ACCESS"));
    }

    @ExceptionHandler(UserExceptions.class)
    public ResponseEntity<ServerErrorDTO> handleUserExceptions(UserExceptions e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ServerErrorDTO(e.getMessage(), "INVALID"));
    }

    @ExceptionHandler(SensorExceptions.class)
    public ResponseEntity<ServerErrorDTO> handleServerExceptions(SensorExceptions e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ServerErrorDTO(e.getMessage(), "INVALID"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ServerErrorDTO> handleUserExceptions(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ServerErrorDTO("Some data already exists", "DUPLICATE_KEY"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ServerErrorDTO> handleUncaughtException(Exception e) {
        String defaultMessage = "Something went wrong";
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ServerErrorDTO(defaultMessage, "ERROR"));
    }
}