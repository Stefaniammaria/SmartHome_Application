package com.example.springbackend.Repositories;

import com.example.springbackend.Entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends CrudRepository<User, UUID> {
    Optional<User> findByName(String name);
    Optional<User>findByUsername(String username);
    Optional<User> findById(UUID userID);
}
