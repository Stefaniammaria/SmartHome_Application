package com.example.springbackend.DTOs;

import com.example.springbackend.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorCreateDTO {
    private String type;
    private String name;
}
