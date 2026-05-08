package com.example.itasset.controller;

import com.example.itasset.dto.ErrorResponse;
import com.example.itasset.dto.MaintenanceRequest;
import com.example.itasset.dto.MessageResponse;
import com.example.itasset.model.Maintenance;
import com.example.itasset.model.User;
import com.example.itasset.repository.MaintenanceRepository;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenances")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    // ========== RÉCUPÉRATION ==========

    @GetMapping
    public ResponseEntity<List<Maintenance>> getAllMaintenances() {
        return ResponseEntity.ok(maintenanceRepository.findAll());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Maintenance>> getAllMaintenancesList() {
        List<Maintenance> all = maintenanceRepository.findAll();
        System.out.println("📊 Nombre total de maintenances : " + all.size());
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceById(id));
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<Maintenance>> getAssetMaintenances(@PathVariable Long assetId) {
        return ResponseEntity.ok(maintenanceService.getAssetMaintenances(assetId));
    }

    // ========== CRÉATION ==========

    @PostMapping
    public ResponseEntity<?> createMaintenance(@RequestBody MaintenanceRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Maintenance maintenance = maintenanceService.createMaintenance(request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(maintenance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== MODIFICATION COMPLÈTE ==========

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaintenance(@PathVariable Long id,
                                               @RequestBody MaintenanceRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            Maintenance maintenance = maintenanceService.updateMaintenance(id, request, currentUser);
            return ResponseEntity.ok(maintenance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== CHANGEMENT DE STATUT ==========

    @PutMapping("/{id}/start")
    public ResponseEntity<Maintenance> startMaintenance(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(maintenanceService.startMaintenance(id, currentUser));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeMaintenance(@PathVariable Long id,
                                                 @RequestBody Map<String, String> request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            String actionsPerformed = request.getOrDefault("actionsPerformed", "");
            Maintenance maintenance = maintenanceService.completeMaintenance(id, actionsPerformed, currentUser);
            return ResponseEntity.ok(maintenance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== SUPPRESSION ==========

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaintenance(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            maintenanceService.deleteMaintenance(id, currentUser);
            return ResponseEntity.ok(new MessageResponse("Maintenance supprimée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}