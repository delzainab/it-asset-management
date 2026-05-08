package com.example.itasset.config;

import com.example.itasset.security.JwtAuthenticationFilter;
import com.example.itasset.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/api/auth/**", "/api/setup/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/assets/**").hasAnyRole("ADMIN", "TECHNICIEN", "CONSULTATION")
                                .requestMatchers(HttpMethod.POST, "/api/assets/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/assets/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/assets/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/assignments/**").hasAnyRole("ADMIN", "TECHNICIEN", "CONSULTATION")
                                .requestMatchers(HttpMethod.POST, "/api/assignments/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/assignments/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/tickets/**").hasAnyRole("ADMIN", "TECHNICIEN", "CONSULTATION")
                                .requestMatchers(HttpMethod.POST, "/api/tickets/**").hasAnyRole("ADMIN", "TECHNICIEN")
                                .requestMatchers(HttpMethod.PUT, "/api/tickets/**").hasAnyRole("ADMIN", "TECHNICIEN")
                                .requestMatchers(HttpMethod.DELETE, "/api/tickets/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/maintenances/**").hasAnyRole("ADMIN", "TECHNICIEN", "CONSULTATION")
                                .requestMatchers(HttpMethod.POST, "/api/maintenances/**").hasAnyRole("ADMIN", "TECHNICIEN")
                                .requestMatchers(HttpMethod.PUT, "/api/maintenances/**").hasAnyRole("ADMIN", "TECHNICIEN")
                                .requestMatchers(HttpMethod.DELETE, "/api/maintenances/**").hasRole("ADMIN")
                                .requestMatchers("/api/users/**").hasRole("ADMIN")
                                .requestMatchers("/api/offices/**").hasRole("ADMIN")
                                .requestMatchers("/api/departments/**").hasRole("ADMIN")
                                .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                                .anyRequest().authenticated()
                );
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}