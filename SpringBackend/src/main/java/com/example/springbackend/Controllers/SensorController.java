package com.example.springbackend.Controllers;

import com.example.springbackend.DTOs.SensorActionDTO;
import com.example.springbackend.DTOs.SensorCreateDTO;
import com.example.springbackend.DTOs.SensorResponseDTO;
import com.example.springbackend.DTOs.UserResponseDTO;
import com.example.springbackend.Exceptions.SensorExceptions;
import com.example.springbackend.Exceptions.UserAuthException;
import com.example.springbackend.Exceptions.UserExceptions;
import com.example.springbackend.Service.SensorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@CrossOrigin
public class SensorController {

    private final SensorService sensorService;

    @PostMapping("/create-sensor")
    public ResponseEntity<SensorResponseDTO> createSensor(@RequestHeader String token, @RequestBody SensorCreateDTO data) throws UserAuthException, SensorExceptions {
        return sensorService.createSensor(token,data);
    }
    @GetMapping("/find-all-sensors")
    public ResponseEntity<List<SensorResponseDTO>> findAllUser(@RequestHeader String token) throws UserAuthException {
        return sensorService.findAllSensors(token);
    }
    /*@DeleteMapping("/delete-sensor/{ID}")
    public ResponseEntity<SensorResponseDTO> deleteUser(@RequestHeader String token, @PathVariable UUID ID) throws UserAuthException, SensorExceptions {
        return sensorService.deleteSensor(token,ID);
    }*/
    @PostMapping("/handle-sensor-action")
    public ResponseEntity handleSensorAction(@RequestHeader String token, @RequestBody SensorActionDTO sensorActionDTO) throws UserAuthException, SensorExceptions {
        return sensorService.handleSensorAction(token,sensorActionDTO);
    }
}
