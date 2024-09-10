package com.example.springbackend.Configuratios;

import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@AllArgsConstructor
public class MainConfig {
    private final CachingConnectionFactory cachingConnectionFactory;
    @Bean
    public ModelMapper modelMapper(){return new ModelMapper();}

    @Bean
    public PasswordEncoder encoder(){return new BCryptPasswordEncoder();}

    @Bean
    public Queue createSensorDataQueue() {
        return new Queue("q.sensor_data");
    }

    @Bean
    public Queue createSensorRequestActionQueue() {
        return new Queue("q.sensor_action");
    }

    @Bean
    public Jackson2JsonMessageConverter converter(){
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(Jackson2JsonMessageConverter converter){
        RabbitTemplate template = new RabbitTemplate(cachingConnectionFactory);
        template.setMessageConverter(converter);
        return template;}

}