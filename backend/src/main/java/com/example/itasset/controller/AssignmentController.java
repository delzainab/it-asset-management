package com.example.itasset.controller;

import com.example.itasset.model.Assignment;
import com.example.itasset.model.User;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:3000")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/assign")
    public ResponseEntity<?> assignAsset(@RequestBody Map<String, Object> request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Long assetId = Long.valueOf(request.get("assetId").toString());
            Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
            Long departmentId = request.get("departmentId") != null ? Long.valueOf(request.get("departmentId").toString()) : null;
            String comment = request.get("comment") != null ? request.get("comment").toString() : "";

            Assignment assignment = assignmentService.assignAsset(assetId, userId, departmentId, comment, currentUser);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/return/{assetId}")
    public ResponseEntity<?> returnAsset(@PathVariable Long assetId,
                                         @RequestBody(required = false) Map<String, String> request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            String comment = request != null && request.containsKey("comment") ? request.get("comment") : "";

            Assignment assignment = assignmentService.returnAsset(assetId, comment, currentUser);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<Assignment>> getAssetHistory(@PathVariable Long assetId) {
        try {
            List<Assignment> history = assignmentService.getAssetHistory(assetId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Assignment>> getUserHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.getUserHistory(userId));
    }

    @GetMapping("/current")
    public ResponseEntity<List<Assignment>> getCurrentAssignments() {
        return ResponseEntity.ok(assignmentService.getCurrentAssignments());
    }
}