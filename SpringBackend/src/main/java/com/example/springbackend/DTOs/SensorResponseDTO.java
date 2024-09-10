package com.example.springbackend.DTOs;

import com.example.springbackend.Entities.Sensor;
import com.example.springbackend.Entities.SensorValue;
import com.example.springbackend.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorResponseDTO {
    private UUID id;
    private String type;
    private String name;
    private List<SensorValueDTO> sensorValues;
}
