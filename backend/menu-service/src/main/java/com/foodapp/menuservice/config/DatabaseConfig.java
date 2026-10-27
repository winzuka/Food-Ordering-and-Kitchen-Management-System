package com.foodapp.menuservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.foodapp.menuservice.repository")
public class DatabaseConfig {

}