package com.example.itasset.controller;

import com.example.itasset.model.Asset;
import com.example.itasset.model.User;
import com.example.itasset.repository.AssetRepository;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:3000")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetRepository.findAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAsset(@PathVariable Long id) {
        return assetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAsset(@RequestBody Asset asset, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Asset created = assetService.createAsset(asset, currentUser);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable Long id, @RequestBody Asset asset, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Asset updated = assetService.updateAsset(id, asset, currentUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            assetService.deleteAsset(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("byType", assetRepository.countByType());
        stats.put("byStatus", assetRepository.countByStatus());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/warranty-expiring")
    public ResponseEntity<List<Asset>> getWarrantyExpiring(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(assetService.getWarrantyExpiringSoon(days));
    }
}