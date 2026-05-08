package com.example.itasset.controller;

import com.example.itasset.model.Role;
import com.example.itasset.model.User;
import com.example.itasset.repository.RoleRepository;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.dto.AdminRequest;
import com.example.itasset.dto.MessageResponse;
import com.example.itasset.dto.ErrorResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "http://localhost:3000")
public class SetupController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody(required = false) AdminRequest request) {
        try {
            System.out.println("=== Création d'admin ===");

            String email = request != null && request.getEmail() != null ?
                    request.getEmail() : "admin@prefecture.ma";
            String password = request != null && request.getPassword() != null ?
                    request.getPassword() : "admin123";
            String fullName = request != null && request.getFullName() != null ?
                    request.getFullName() : "Administrateur";

            System.out.println("Email: " + email);
            System.out.println("Password (clair): " + password);
            if (request != null && request.getDeleteExisting() != null && request.getDeleteExisting()) {
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    userRepository.delete(existingUser.get());
                    System.out.println("Ancien admin supprimé: " + email);
                }
            }
            Optional<Role> adminRoleOpt = roleRepository.findByName("ADMIN");
            if (!adminRoleOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Rôle ADMIN non trouvé!"));
            }
            Role adminRole = adminRoleOpt.get();
            System.out.println("Rôle ADMIN trouvé: ID=" + adminRole.getId());
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Email déjà utilisé: " + email));
            }
            String hashedPassword = passwordEncoder.encode(password);
            System.out.println("Password hashé: " + hashedPassword);
            User admin = new User();
            admin.setFullName(fullName);
            admin.setEmail(email);
            admin.setPassword(hashedPassword);
            admin.setRole(adminRole);
            admin.setActive(true);

            userRepository.save(admin);
            System.out.println("Admin sauvegardé avec ID: " + admin.getId());

            return ResponseEntity.ok(new MessageResponse("Admin créé avec succès!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Erreur: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete-admin/{email}")
    public ResponseEntity<?> deleteAdmin(@PathVariable String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Utilisateur non trouvé: " + email));
            }

            userRepository.delete(userOpt.get());

            return ResponseEntity.ok(new MessageResponse("Utilisateur supprimé: " + email));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Erreur: " + e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkSetup() {
        Map<String, Object> response = new HashMap<>();

        response.put("roles_count", roleRepository.count());
        response.put("users_count", userRepository.count());
        response.put("roles", roleRepository.findAll());

        Optional<User> adminOpt = userRepository.findByEmail("admin@prefecture.ma");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            response.put("admin_exists", true);
            response.put("admin_email", admin.getEmail());
            response.put("admin_name", admin.getFullName());
            response.put("admin_role", admin.getRole().getName());

            boolean passwordMatches = passwordEncoder.matches("admin123", admin.getPassword());
            response.put("password_matches_admin123", passwordMatches);
        } else {
            response.put("admin_exists", false);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-login")
    public ResponseEntity<?> testLogin(@RequestParam String email, @RequestParam String password) {
        try {
            System.out.println("=== TEST LOGIN ===");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (!userOpt.isPresent()) {
                System.out.println("❌ Utilisateur non trouvé");
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Utilisateur non trouvé",
                        "email", email
                ));
            }
            User user = userOpt.get();
            System.out.println("✅ Utilisateur trouvé: " + user.getEmail());
            System.out.println("Rôle: " + (user.getRole() != null ? user.getRole().getName() : "NULL"));
            System.out.println("Password hashé stocké: " + user.getPassword());
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Password matches: " + passwordMatches);
            boolean hasRole = user.getRole() != null;
            String roleName = hasRole ? user.getRole().getName() : "AUCUN";
            Long roleId = hasRole ? user.getRole().getId() : null;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user_exists", true);
            response.put("user_id", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("password_matches", passwordMatches);
            response.put("has_role", hasRole);
            response.put("role_name", roleName);
            response.put("role_id", roleId);
            response.put("stored_password_hash", user.getPassword());

            if (!passwordMatches) {
                response.put("suggestion", "Le mot de passe ne correspond pas. Vérifie que tu utilises le bon mot de passe.");
            }

            if (!hasRole) {
                response.put("suggestion", "L'utilisateur n'a pas de rôle! Utilise /api/setup/assign-role pour lui assigner un rôle.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }
    @PostMapping("/assign-role")
    public ResponseEntity<?> assignRole(@RequestParam String email, @RequestParam String roleName) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Utilisateur non trouvé: " + email));
            }

            Optional<Role> roleOpt = roleRepository.findByName(roleName);
            if (!roleOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Rôle non trouvé: " + roleName));
            }

            User user = userOpt.get();
            user.setRole(roleOpt.get());
            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse("Rôle assigné avec succès à " + email));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Erreur: " + e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}