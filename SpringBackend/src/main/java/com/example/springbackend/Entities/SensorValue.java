package com.example.springbackend.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "SensorValue")
public class SensorValue {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "propertyName", nullable = false)
    private String propertyName;

    @Column(name = "value", nullable = false)
    private String value;

    @ManyToOne(fetch=FetchType.EAGER, cascade = CascadeType.DETACH)
    @JoinColumn(name="sensor_id", nullable=false)
    private Sensor sensor;

}
