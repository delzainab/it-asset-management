package com.example.itasset.controller;

import com.example.itasset.model.Department;
import com.example.itasset.model.Asset;
import com.example.itasset.repository.DepartmentRepository;
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
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return departmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Department saved = departmentRepository.save(department);
            String userEmail = userDetails != null ? userDetails.getUsername() : "SYSTEM";
            System.out.println("📝 Service créé: " + saved.getName() + " par " + userEmail);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Service créé avec succès");
            response.put("id", saved.getId().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department department,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Department existing = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Service non trouvé"));

            existing.setName(department.getName());
            existing.setDescription(department.getDescription());

            Department updated = departmentRepository.save(existing);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Service modifié avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Department department = departmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Service non trouvé"));
            List<Asset> assetsWithService = assetRepository.findByServiceId(id);
            if (!assetsWithService.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Impossible de supprimer ce service car il est utilisé par des assets");
                error.put("assetsCount", assetsWithService.size());
                error.put("assets", assetsWithService.stream()
                        .map(a -> a.getType() + " - " + a.getBrand() + " " + a.getModel() + " (Série: " + a.getSerialNumber() + ")")
                        .toList());
                return ResponseEntity.badRequest().body(error);
            }

            departmentRepository.deleteById(id);
            String userEmail = userDetails != null ? userDetails.getUsername() : "SYSTEM";
            System.out.println("📝 Service supprimé: " + department.getName() + " par " + userEmail);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Service supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}