package com.example.springbackend.DTOs;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorValueDTO {
    private UUID id;
    private String propertyName;
    private String value;
}
