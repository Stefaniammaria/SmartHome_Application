package com.example.springbackend.DTOs;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = "timestamp")
public class ServerErrorDTO {
    private String message;
    private String status;
    private Instant timestamp;

    public ServerErrorDTO(String message, String status) {
        this.message = message;
        this.status = status;
        this.timestamp = Instant.now();
    }
}