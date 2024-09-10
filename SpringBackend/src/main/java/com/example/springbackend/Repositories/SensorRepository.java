package com.example.springbackend.Repositories;

import com.example.springbackend.Entities.Sensor;
import com.example.springbackend.Entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SensorRepository extends CrudRepository<Sensor, UUID> {
    Optional<Sensor> findById(UUID sensorID);
    List<Sensor> findAllByUser (User user);
}
