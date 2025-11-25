package com.sikgu.sikgubackend;

import com.sikgu.sikgubackend.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class SikguBackendApplicationTests {

    @MockitoBean
    private EmailService emailService;

	@Test
	void contextLoads() {
	}

}
