package com.example.itasset.controller;

import com.example.itasset.model.User;
import com.example.itasset.model.Role;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.repository.RoleRepository;
import com.example.itasset.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email déjà utilisé");
                return ResponseEntity.badRequest().body(error);
            }

            if (user.getRole() == null || user.getRole().getId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Rôle requis");
                return ResponseEntity.badRequest().body(error);
            }

            Role role = roleRepository.findById(user.getRole().getId())
                    .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
            user.setRole(role);

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User saved = userRepository.save(user);

            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            auditLogService.log(currentUser, "CREATE", "User", saved.getId(),
                    "Création utilisateur: " + user.getFullName() + " (" + user.getEmail() + ")");

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Utilisateur créé avec succès");
            response.put("id", saved.getId());
            response.put("fullName", saved.getFullName());
            response.put("email", saved.getEmail());
            response.put("role", saved.getRole().getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails,
                                        @AuthenticationPrincipal UserDetails userDetailsAuth) {
        try {
            System.out.println("=== MISE À JOUR UTILISATEUR ===");
            System.out.println("ID: " + id);
            System.out.println("FullName reçu: " + userDetails.getFullName());
            System.out.println("Email reçu: " + userDetails.getEmail());
            System.out.println("Active reçu: " + userDetails.getActive());

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            System.out.println("Ancien nom: " + user.getFullName());
            System.out.println("Ancien email: " + user.getEmail());

            if (userDetails.getFullName() != null && !userDetails.getFullName().isEmpty()) {
                user.setFullName(userDetails.getFullName());
            }
            if (userDetails.getEmail() != null && !userDetails.getEmail().isEmpty()) {
                user.setEmail(userDetails.getEmail());
            }
            if (userDetails.getActive() != null) {
                user.setActive(userDetails.getActive());
            }
            if (userDetails.getRole() != null && userDetails.getRole().getId() != null) {
                Role role = roleRepository.findById(userDetails.getRole().getId())
                        .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
                user.setRole(role);
            }
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                System.out.println("Mot de passe mis à jour");
            }

            User updated = userRepository.save(user);

            System.out.println("Nouveau nom: " + updated.getFullName());
            System.out.println("Nouvel email: " + updated.getEmail());
            System.out.println("✅ Utilisateur mis à jour avec succès");

            User currentUser = userRepository.findByEmail(userDetailsAuth.getUsername()).orElse(null);
            auditLogService.log(currentUser, "UPDATE", "User", id,
                    "Modification utilisateur: " + user.getFullName());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Utilisateur modifié avec succès");
            response.put("id", updated.getId());
            response.put("fullName", updated.getFullName());
            response.put("email", updated.getEmail());
            response.put("role", updated.getRole() != null ? updated.getRole().getName() : null);
            response.put("active", updated.getActive());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            userRepository.deleteById(id);

            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            auditLogService.log(currentUser, "DELETE", "User", id,
                    "Suppression utilisateur: " + user.getFullName() + " (" + user.getEmail() + ")");

            Map<String, String> response = new HashMap<>();
            response.put("message", "Utilisateur supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}