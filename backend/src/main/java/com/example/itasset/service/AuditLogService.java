package com.example.itasset.service;

import com.example.itasset.model.AuditLog;
import com.example.itasset.model.User;
import com.example.itasset.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(User user, String action, String entityName, Long entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
        System.out.println("📝 AUDIT LOG: " + (user != null ? user.getEmail() : "SYSTEM") +
                " - " + action + " - " + entityName + " ID:" + entityId + " - " + details);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByEntity(String entityName, Long entityId) {
        return auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc(entityName, entityId);
    }

    public List<AuditLog> getLogsByUser(User user) {
        return auditLogRepository.findByUserOrderByTimestampDesc(user);
    }

    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByAction(action);
    }
}