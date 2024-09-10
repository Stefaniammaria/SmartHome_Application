package com.example.springbackend.Controllers;

import com.example.springbackend.DTOs.AuthDTO;
import com.example.springbackend.DTOs.UserCreateDTO;
import com.example.springbackend.DTOs.UserLogInDTO;
import com.example.springbackend.DTOs.UserResponseDTO;
import com.example.springbackend.Exceptions.UserAuthException;
import com.example.springbackend.Exceptions.UserExceptions;
import com.example.springbackend.Service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@AllArgsConstructor
@CrossOrigin
public class UserController {
    private final UserService userService;

    @PostMapping("/register-user")
    public ResponseEntity<AuthDTO> registerUser(@RequestBody UserCreateDTO data) throws UserExceptions {
        return userService.createUser(data);
    }

    @PostMapping("/login-user")
    public ResponseEntity<AuthDTO> logIn(@RequestBody UserLogInDTO data) throws UserAuthException {
        return userService.logInUser(data);
    }

    @GetMapping("/find-user/{ID}")
    public ResponseEntity<UserResponseDTO> findUser(@PathVariable UUID ID, @RequestHeader String token) throws UserExceptions, UserAuthException {
        return userService.findUser(ID,token);
    }

    @GetMapping("/find-all-users")
    public ResponseEntity<List<UserResponseDTO>> findAllUser(@RequestHeader String token) throws UserExceptions, UserAuthException {
        return userService.findAllUser(token);
    }

    @PutMapping("/update-user/{ID}")
    public ResponseEntity<UserResponseDTO> updateUser(@RequestBody UserCreateDTO data, @RequestHeader String token, @PathVariable UUID ID) throws UserExceptions, UserAuthException {
        return userService.updateUser(data,token,ID);
    }
    //atunci cand creez si cand updatez un user lucrez cu aceleasi 3 fielduri, name, username si password,
    //aveam deja creat dto-ul de createUser cu aceste 3 valori, nu avea rost sa mai fac un dto updateUser cu aceleasi 3 valori

    @DeleteMapping("/delete-user/{ID}")
    public ResponseEntity<UserResponseDTO> deleteUser(@RequestHeader String token, @PathVariable UUID ID) throws UserExceptions, UserAuthException {
        return userService.deleteUser(token,ID);
    }
}
