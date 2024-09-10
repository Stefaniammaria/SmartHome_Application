package com.example.springbackend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorMessageDTO {
    private UUID id;
    private String type;
    private String temp;
    private String hum;
    private String win;
    private String alarm;
    private String moved;
    private String led;
    private String rgb;
    private String ac;
    private String dt;
}
