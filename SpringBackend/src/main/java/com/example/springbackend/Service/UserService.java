package com.example.springbackend.Service;

import com.example.springbackend.DTOs.AuthDTO;
import com.example.springbackend.DTOs.UserCreateDTO;
import com.example.springbackend.DTOs.UserLogInDTO;
import com.example.springbackend.DTOs.UserResponseDTO;
import com.example.springbackend.Entities.User;
import com.example.springbackend.Exceptions.UserAuthException;
import com.example.springbackend.Exceptions.UserExceptions;
import com.example.springbackend.Repositories.UserRepository;
import com.example.springbackend.Tools.JwtTokenUtil;
import com.example.springbackend.Tools.UserValidator;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserService {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserValidator userValidator;

    public ResponseEntity<AuthDTO> createUser(UserCreateDTO userData) throws UserExceptions {

        userValidator.validateUser(userData, false);

        String encodedPass = passwordEncoder.encode(userData.getPassword());
        userData.setPassword(encodedPass);
        User user = modelMapper.map(userData, User.class);
        User savedUser = userRepository.save(user);
        UserResponseDTO userResponseDTO = modelMapper.map(savedUser, UserResponseDTO.class);

        String token = jwtTokenUtil.generateToken(savedUser.getId());
        AuthDTO authDTO = new AuthDTO(userResponseDTO, token);
        return ResponseEntity.ok().body(authDTO);

    }

    public ResponseEntity<AuthDTO> logInUser(UserLogInDTO userData) throws UserAuthException {
        Optional<User> findUser = userRepository.findByUsername(userData.getUsername());

        if (findUser.isEmpty()) {
            throw new UserAuthException("User not found");
        }
        User foundUser = findUser.get();
        if (passwordEncoder.matches(userData.getPassword(), foundUser.getPassword())) {
            UserResponseDTO userResponseDTO = modelMapper.map(foundUser, UserResponseDTO.class);
            String token = jwtTokenUtil.generateToken(foundUser.getId());
            AuthDTO authDTO = new AuthDTO(userResponseDTO, token);
            return ResponseEntity.ok().body(authDTO);
        }
        throw new UserAuthException("Password incorrect");

    }

    public ResponseEntity<UserResponseDTO> findUser(UUID ID, String token) throws UserExceptions, UserAuthException {

        User user = userValidator.authUser(token);  //sa fie logat

        Optional<User> userFound = userRepository.findById(ID);

        if (userFound.isEmpty()) {
            throw new UserExceptions("User not found");
        }
        UserResponseDTO userResponseDTO = modelMapper.map(userFound, UserResponseDTO.class);
        return ResponseEntity.ok().body(userResponseDTO);
    }

    public ResponseEntity<List<UserResponseDTO>> findAllUser(String token) throws UserExceptions, UserAuthException {

        User user = userValidator.authUser(token);  //sa fie logat

        List<User> usersList = (List<User>) userRepository.findAll();

        List<UserResponseDTO> userResponseDTOS = usersList.stream().map(u ->modelMapper.map(u, UserResponseDTO.class)).toList();
        return ResponseEntity.ok().body(userResponseDTOS);
    }

    public ResponseEntity<UserResponseDTO> updateUser(UserCreateDTO data, String token, UUID ID) throws UserAuthException, UserExceptions {
        User user = userValidator.authUser(token);  //sa fie logat

        Optional<User> found = userRepository.findById(ID);
        if (found.isEmpty()) {
            throw new UserExceptions("User not found");
        }
        User userFound = found.get();

        if (data.getUsername() != null && !data.getUsername().isEmpty()) {
            userValidator.validateUsername(data.getUsername());
            userFound.setUsername(data.getUsername());
        }

        if (data.getName() != null && !data.getName().isEmpty()) {
            userValidator.validateName(data.getName());
            userFound.setName(data.getName());
        }

        if (data.getPassword() != null && !data.getPassword().isEmpty()) {
            userValidator.validatePassword(data.getPassword());
            String encodedPass = passwordEncoder.encode(data.getPassword());
            userFound.setPassword(encodedPass);
        }

        User savedUser = userRepository.save(userFound);
        UserResponseDTO userResponseDTO = modelMapper.map(savedUser, UserResponseDTO.class);
        return ResponseEntity.ok().body(userResponseDTO);
    }

    public ResponseEntity<UserResponseDTO> deleteUser(String token, UUID ID) throws UserAuthException, UserExceptions {
        User user = userValidator.authUser(token);  //sa fie logat

        Optional<User> found = userRepository.findById(ID);
        if (found.isEmpty()) {
            throw new UserExceptions("User not found");
        }
        User userFound = found.get();

        userRepository.delete(userFound);
        UserResponseDTO userResponseDTO = modelMapper.map(userFound, UserResponseDTO.class);
        return ResponseEntity.ok().body(userResponseDTO);
    }
}
