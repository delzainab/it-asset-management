package com.example.itasset.controller;

import com.example.itasset.dto.JwtResponse;
import com.example.itasset.dto.LoginRequest;
import com.example.itasset.dto.RegisterRequest;
import com.example.itasset.model.Role;
import com.example.itasset.model.User;
import com.example.itasset.repository.RoleRepository;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email ou mot de passe incorrect");
                return ResponseEntity.badRequest().body(error);
            }
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            JwtResponse response = new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    Collections.singletonList(user.getRole().getName())
            );

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email ou mot de passe incorrect");
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email déjà utilisé");
                return ResponseEntity.badRequest().body(error);
            }

            Role role = roleRepository.findByName(registerRequest.getRole())
                    .orElseThrow(() -> new RuntimeException("Rôle non trouvé: " + registerRequest.getRole()));

            User user = new User();
            user.setFullName(registerRequest.getFullName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole(role);
            user.setActive(true);

            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Utilisateur créé avec succès");
            response.put("email", user.getEmail());
            response.put("role", user.getRole().getName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}