package com.sikgu.sikgubackend.repository;

import com.sikgu.sikgubackend.entity.User;
import com.sikgu.sikgubackend.entity.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@Transactional
@SpringBootTest
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    @Test
    void save() {
        User user = new User("aaa@naver.com", "1234", "john", "seoul", Role.USER);

        User savedUser = userRepository.save(user);

        User foundedUser = userRepository.findById(user.getId()).get();

        assertThat(foundedUser).isEqualTo(savedUser);
    }
}