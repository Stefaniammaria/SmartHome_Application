package com.example.springbackend.Tools;

import com.example.springbackend.DTOs.IUser;
import com.example.springbackend.Entities.User;
import com.example.springbackend.Exceptions.UserAuthException;
import com.example.springbackend.Exceptions.UserExceptions;
import com.example.springbackend.Repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
@AllArgsConstructor
public class UserValidator {

    private final UserRepository userRepository;
    private final JwtTokenUtil jwt;

    public void validateUser(IUser user, Boolean ignorePassword) throws UserExceptions {
        try {
            Class<? extends IUser> userClass = user.getClass();
            for (Field f : userClass.getDeclaredFields()) {
                if ("name".equals(f.getName())) {
                    String name = (String) getValueOfField(f.getName(), user);
                    validateName(name);
                } else if ("username".equals(f.getName())) {
                    String username = (String) getValueOfField(f.getName(), user);
                    validateUsername(username);
                } else if (!ignorePassword && "password".equals(f.getName())) {
                    String password = (String) getValueOfField(f.getName(), user);
                    validatePassword(password);
                }
            }
        } catch (IntrospectionException | InvocationTargetException | IllegalAccessException e) {
            e.printStackTrace();
            throw new UserExceptions("Could not do validation");
        }
    }

    public User authUser(String token) throws UserAuthException {
        UUID userId = jwt.getIdFromToken(token);
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty() || jwt.isTokenExpired(token)) {
            String message = "Session expired. You need to login or register if you want to access this content!";
            throw new UserAuthException(message);
        }
        return userOptional.get();
    }

    public void validateName(String name) throws UserExceptions {
        if (!Pattern.matches("^[a-zA-Z]+\\s+[a-zA-Z]+.*$", name)) {
            throw new UserExceptions("Invalid name!");
        }
    }

//    The username consists of 6 to 30 characters inclusive. If the username
//    consists of less than 6 or greater than 30 characters, then it is an invalid username.
//    The username can only contain alphanumeric characters and underscores (_). Alphanumeric characters describe the character set consisting of lowercase characters [a – z], uppercase characters [A – Z], and digits [0 – 9].
//    The first character of the username must be an alphabetic character, i.e., either lowercase character
//    [a – z] or uppercase character [A – Z].

    public void validateUsername(String username) throws UserExceptions {
        if (!Pattern.matches("^[A-Za-z]\\w{5,29}$", username)){
            throw new UserExceptions("Invalid username");
        }
    }

    public void validatePassword(String password) throws UserExceptions {
        if (!Pattern.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", password)) {
            throw new UserExceptions("Password must contain 8 digits, an uppercase letter, lowercase letter, a digit and a special character!");
        }
    }

    private Object getValueOfField(String nameOfField, Object obj) throws IntrospectionException, InvocationTargetException, IllegalAccessException {
        PropertyDescriptor propertyDescriptor = new PropertyDescriptor(nameOfField, obj.getClass());
        Method getter = propertyDescriptor.getReadMethod();
        return getter.invoke(obj);
    }
}
