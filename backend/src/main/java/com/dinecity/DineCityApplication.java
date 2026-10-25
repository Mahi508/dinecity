package com.dinecity;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DineCityApplication {

    public static void main(String[] args) {
        // Run in UTC so the JDBC driver never sends a legacy zone name like "Asia/Calcutta".
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(DineCityApplication.class, args);
    }
}
