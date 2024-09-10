package com.example.springbackend.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Sensor")
public class Sensor {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch=FetchType.EAGER, cascade = CascadeType.DETACH)
    @JoinColumn(name="user_id", nullable=false)
    private User user;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "name", nullable = false)
    private String name;

    @OneToMany(mappedBy="sensor",fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    private List<SensorValue> sensorValues;


}
