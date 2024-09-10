package com.example.springbackend.Repositories;

import com.example.springbackend.Entities.Sensor;
import com.example.springbackend.Entities.SensorValue;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SensorValueRepository extends CrudRepository<SensorValue, UUID> {
    List<SensorValue> findAllBySensor (Sensor sensor);
    void deleteBySensor(Sensor sensor);
}
