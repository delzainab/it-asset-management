package com.example.itasset.controller;

import com.example.itasset.model.Office;
import com.example.itasset.model.Asset;
import com.example.itasset.repository.OfficeRepository;
import com.example.itasset.repository.AssetRepository;
import com.example.itasset.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offices")
@CrossOrigin(origins = "http://localhost:3000")
public class OfficeController {

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<Office>> getAllOffices() {
        return ResponseEntity.ok(officeRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Office> getOfficeById(@PathVariable Long id) {
        return officeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOffice(@RequestBody Office office,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Office saved = officeRepository.save(office);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Bureau créé avec succès");
            response.put("id", saved.getId().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOffice(@PathVariable Long id, @RequestBody Office office,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Office existing = officeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bureau non trouvé"));

            existing.setName(office.getName());
            existing.setFloor(office.getFloor());
            existing.setBuilding(office.getBuilding());
            existing.setSite(office.getSite());

            Office updated = officeRepository.save(existing);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Bureau modifié avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOffice(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Office office = officeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bureau non trouvé"));
            List<Asset> assetsWithOffice = assetRepository.findByOfficeId(id);
            if (!assetsWithOffice.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Impossible de supprimer ce bureau car il est utilisé par des assets");
                error.put("assetsCount", assetsWithOffice.size());
                error.put("assets", assetsWithOffice.stream()
                        .map(a -> a.getType() + " - " + a.getBrand() + " " + a.getModel() + " (Série: " + a.getSerialNumber() + ")")
                        .toList());
                return ResponseEntity.badRequest().body(error);
            }

            officeRepository.deleteById(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Bureau supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}