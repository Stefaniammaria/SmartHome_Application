package com.example.springbackend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorActionDTO {
    private UUID sensorId;
    private Boolean toggleValue;
    private String optionalValue;
}
