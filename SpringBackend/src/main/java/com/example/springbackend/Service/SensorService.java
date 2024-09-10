package com.example.springbackend.Service;

import com.example.springbackend.DTOs.*;
import com.example.springbackend.Entities.Sensor;
import com.example.springbackend.Entities.SensorValue;
import com.example.springbackend.Entities.User;
import com.example.springbackend.Exceptions.SensorExceptions;
import com.example.springbackend.Exceptions.UserAuthException;
import com.example.springbackend.Repositories.SensorRepository;
import com.example.springbackend.Repositories.SensorValueRepository;
import com.example.springbackend.Tools.UserValidator;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@AllArgsConstructor
public class SensorService {

    private final SensorRepository sensorRepository;
    private final ModelMapper modelMapper;
    private final UserValidator userValidator;
    private final RabbitTemplate rabbitTemplate;
    private final SimpMessagingTemplate simpMessagingTemplate;


    public ResponseEntity<SensorResponseDTO> createSensor(String token, SensorCreateDTO sensorData) throws UserAuthException, SensorExceptions {
        User user = userValidator.authUser(token);

        Sensor sensor = new Sensor();
        sensor.setUser(user);
        if(sensorData.getType() == ""){
            throw new SensorExceptions("Can't leave the type field empty.");
        }
        String type = sensorData.getType();
        sensor.setType(type);
        if(sensorData.getName() == ""){
            throw new SensorExceptions("Can't leave the name field empty.");
        }
        sensor.setName(sensorData.getName());
        List<SensorValue> values = new ArrayList<>();

        switch (type) {
            case "TempHum" -> {
                SensorValue sensorValue1 = new SensorValue();
                sensorValue1.setPropertyName("TEMP");
                sensorValue1.setValue("0");
                sensorValue1.setSensor(sensor);

                SensorValue sensorValue2 = new SensorValue();
                sensorValue2.setPropertyName("HUM");
                sensorValue2.setValue("0");
                sensorValue2.setSensor(sensor);

                values.add(sensorValue1);
                values.add(sensorValue2);
            }
            case "Led" -> {
                SensorValue sensorValueLed = new SensorValue();
                sensorValueLed.setPropertyName("LED");
                sensorValueLed.setValue("0");
                sensorValueLed.setSensor(sensor);
                values.add(sensorValueLed);
            }
            case "AC" -> {
                SensorValue sensorValueAC = new SensorValue();
                sensorValueAC.setPropertyName("AC");
                sensorValueAC.setValue("0");
                sensorValueAC.setSensor(sensor);

                SensorValue desiredTemperature = new SensorValue();
                desiredTemperature.setPropertyName("DT");
                desiredTemperature.setValue("0");
                desiredTemperature.setSensor(sensor);

                values.add(sensorValueAC);
                values.add(desiredTemperature);
            }
            case "Window" -> {
                SensorValue sensorValueWindow = new SensorValue();
                sensorValueWindow.setPropertyName("WIN");
                sensorValueWindow.setValue("0");
                sensorValueWindow.setSensor(sensor);
                values.add(sensorValueWindow);
            }
            case "Alarm" -> {
                SensorValue sensorValueAlarm = new SensorValue();
                sensorValueAlarm.setPropertyName("ALARM");
                sensorValueAlarm.setValue("0");
                sensorValueAlarm.setSensor(sensor);

                SensorValue sensorValueMovement = new SensorValue();
                sensorValueMovement.setPropertyName("MOVE");
                sensorValueMovement.setValue("0");
                sensorValueMovement.setSensor(sensor);

                values.add(sensorValueAlarm);
                values.add(sensorValueMovement);
            }
            case "RGBLed" -> {
                SensorValue sensorValueRGBLed = new SensorValue();
                sensorValueRGBLed.setPropertyName("LEDRBG");
                sensorValueRGBLed.setValue("0");
                sensorValueRGBLed.setSensor(sensor);

                SensorValue sensorValueRGB = new SensorValue();
                sensorValueRGB.setPropertyName("RBG");
                sensorValueRGB.setValue("0");
                sensorValueRGB.setSensor(sensor);

                values.add(sensorValueRGBLed);
                values.add(sensorValueRGB);
            }
            default -> {
                throw new SensorExceptions("Incorrect sensor type!");
            }
        }

        sensor.setSensorValues(values);
        Sensor savedSensor = sensorRepository.save(sensor);
        SensorResponseDTO sensorResponseDTO = modelMapper.map(savedSensor, SensorResponseDTO.class);

        return ResponseEntity.ok().body(sensorResponseDTO);
    }
    // O problema de care m-am lovit a fost la transmiterea raspunsului inapoi pentru ca aveam cicluri.
    // Cand afisam un senzor se afisa si userul care detinea sensorul, dar afisand userul se afisa si
    // lista de senzori si tot asa.

    public ResponseEntity<List<SensorResponseDTO>> findAllSensors(String token) throws UserAuthException {
        User user = userValidator.authUser(token);

        List<Sensor> sensors = sensorRepository.findAllByUser(user);
        List<SensorResponseDTO> sensorResponseDTOS = sensors.stream().map(s -> modelMapper.map(s, SensorResponseDTO.class)).toList();

        return ResponseEntity.ok().body(sensorResponseDTOS);
    }

    public ResponseEntity handleSensorAction(String token, SensorActionDTO sensorActionDTO) throws UserAuthException, SensorExceptions {
        User user = userValidator.authUser(token);

        Optional<Sensor> found = sensorRepository.findById(sensorActionDTO.getSensorId());
        if (found.isEmpty()) {
            throw new SensorExceptions("Sensor not found");
        }

        Sensor sensor = found.get();

        if (!sensor.getUser().getId().equals(user.getId())) {
            throw new SensorExceptions("Sensor doesn't belong to logged user!");
        }

        rabbitTemplate.convertAndSend("", "q.sensor_action", sensorActionDTO);

        return ResponseEntity.ok().body(null);
    }

    /*@Transactional
    public ResponseEntity<SensorResponseDTO> deleteSensor(String token, UUID id) throws UserAuthException, SensorExceptions {
        User user = userValidator.authUser(token);

        Optional<Sensor> found = sensorRepository.findById(id);
        if (found.isEmpty()) {
            throw new SensorExceptions("Sensor not found");
        }
        Sensor sensorFound = found.get();
        sensorFound.setSensorValues(new LinkedList<>());
        sensorRepository.save(sensorFound);
        sensorValueRepository.deleteBySensor(sensorFound);
        sensorRepository.delete(sensorFound);
        SensorResponseDTO sensorResponseDTO = modelMapper.map(sensorFound, SensorResponseDTO.class);

        return  ResponseEntity.ok().body(sensorResponseDTO);
    }*/

    @RabbitListener(queues = {"q.sensor_data"})
    public void readDeviceMessage(List<SensorMessageDTO> sensorMessages) {
        List<Sensor> sensors = new ArrayList<>();
        sensorMessages.forEach(sensorMessageDTO -> {
            Optional<Sensor> sensorOptional = sensorRepository.findById(sensorMessageDTO.getId());
            if (sensorOptional.isPresent() && sensorOptional.get().getType().equals(sensorMessageDTO.getType())) {
                Sensor sensor = sensorOptional.get();
                sensors.add(sensor);
                System.out.println(sensorMessageDTO);
                switch (sensor.getType()) {
                    case "TempHum" -> {
                        Optional<SensorValue> humSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("HUM")).findFirst();
                        if (humSensorValue.isPresent() && !sensorMessageDTO.getHum().isEmpty()) {
                            humSensorValue.get().setValue(sensorMessageDTO.getHum());
                        }
                        Optional<SensorValue> tempSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("TEMP")).findFirst();
                        if (tempSensorValue.isPresent() && !sensorMessageDTO.getTemp().isEmpty()) {
                            tempSensorValue.get().setValue(sensorMessageDTO.getTemp());
                        }
                        sensorRepository.save(sensor);
                    }
                    case "Led" -> {
                        Optional<SensorValue> ledSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("LED")).findFirst();
                        if (ledSensorValue.isPresent() && !sensorMessageDTO.getLed().isEmpty()) {
                            ledSensorValue.get().setValue(sensorMessageDTO.getLed());
                        }
                        sensorRepository.save(sensor);
                    }
                    case "AC" -> {
                        Optional<SensorValue> acSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("AC")).findFirst();
                        if(acSensorValue.isPresent() && !sensorMessageDTO.getAc().isEmpty()){
                            acSensorValue.get().setValue(sensorMessageDTO.getAc());
                        }
                        Optional<SensorValue> dtSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("DT")).findFirst();
                        if(dtSensorValue.isPresent() && !sensorMessageDTO.getDt().isEmpty()){
                            dtSensorValue.get().setValue(sensorMessageDTO.getDt());
                        }
                        sensorRepository.save(sensor);
                    }
                    case "Window" -> {
                        Optional<SensorValue> windowSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("WIN")).findFirst();
                        if (windowSensorValue.isPresent() && !sensorMessageDTO.getWin().isEmpty()) {
                            windowSensorValue.get().setValue(sensorMessageDTO.getWin());
                        }
                        sensorRepository.save(sensor);
                    }
                    case "Alarm" -> {
                        Optional<SensorValue> alarmSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("ALARM")).findFirst();
                        if (alarmSensorValue.isPresent() && !sensorMessageDTO.getAlarm().isEmpty()) {
                            alarmSensorValue.get().setValue(sensorMessageDTO.getAlarm());
                        }
                        Optional<SensorValue> movementSensorValue = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("MOVE")).findFirst();
                        if (movementSensorValue.isPresent() && !sensorMessageDTO.getMoved().isEmpty() && sensorMessageDTO.getMoved().equals("true")) {

                            String now = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss").format(new java.util.Date());
                            movementSensorValue.get().setValue(now);
                        }
                        sensorRepository.save(sensor);
                    }
                    case "RGBLed" -> {
                        Optional<SensorValue> color = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("RBG")).findFirst();
                        Optional<SensorValue> led = sensor.getSensorValues().stream().filter(x -> x.getPropertyName().equals("LEDRBG")).findFirst();
                        if (color.isPresent() && !sensorMessageDTO.getRgb().isEmpty()) {
                            color.get().setValue(sensorMessageDTO.getRgb());
                            if (led.isPresent()) {
                                if (color.get().getValue().equals("#000000")) {
                                    led.get().setValue("0");
                                } else {
                                    led.get().setValue("1");
                                }
                            }
                        }
                        sensorRepository.save(sensor);
                    }
                }
            }
        });
        if (!sensors.isEmpty()) {
            String ownerId = sensors.get(0).getUser().getId().toString();
            List<SensorResponseDTO> sensorResponseDTOS = sensors.stream().map(s -> modelMapper.map(s, SensorResponseDTO.class)).toList();
            simpMessagingTemplate.convertAndSend("/sensors/data-changed/" + ownerId, sensorResponseDTOS);
        }
    }

}
