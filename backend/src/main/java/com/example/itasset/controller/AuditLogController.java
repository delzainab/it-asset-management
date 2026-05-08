package com.example.itasset.controller;

import com.example.itasset.model.AuditLog;
import com.example.itasset.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:3000")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/entity/{entityName}/{entityId}")
    public ResponseEntity<List<AuditLog>> getLogsByEntity(@PathVariable String entityName, @PathVariable Long entityId) {
        return ResponseEntity.ok(auditLogService.getLogsByEntity(entityName, entityId));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLog>> getLogsByAction(@PathVariable String action) {
        return ResponseEntity.ok(auditLogService.getLogsByAction(action));
    }
}