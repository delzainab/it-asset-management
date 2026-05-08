package com.example.itasset.service;

import com.example.itasset.dto.MaintenanceRequest;
import com.example.itasset.model.*;
import com.example.itasset.repository.AssetRepository;
import com.example.itasset.repository.MaintenanceRepository;
import com.example.itasset.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    // ========== CRÉATION ==========
    @Transactional
    public Maintenance createMaintenance(MaintenanceRequest request, User currentUser) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset non trouvé"));

        Maintenance maintenance = new Maintenance();
        maintenance.setAsset(asset);
        maintenance.setType(request.getType());
        maintenance.setProblemDescription(request.getProblemDescription());
        maintenance.setActionsPerformed(request.getActionsPerformed());
        maintenance.setInterventionDate(request.getInterventionDate());
        maintenance.setDuration(request.getDuration());
        maintenance.setCost(request.getCost());
        maintenance.setProvider(request.getProvider());
        maintenance.setStatus("PLANIFIE");
        maintenance.setTechnician(currentUser);
        maintenance.setCreatedAt(LocalDateTime.now());

        if ("CORRECTIVE".equals(request.getType())) {
            asset.setStatus(AssetStatus.EN_REPARATION);
            assetRepository.save(asset);
        }

        Maintenance saved = maintenanceRepository.save(maintenance);

        auditLogService.log(currentUser, "MAINTENANCE", "Maintenance", saved.getId(),
                "Création maintenance " + request.getType() + " sur " + asset.getType());

        return saved;
    }

    // ========== MODIFICATION COMPLÈTE ==========
    @Transactional
    public Maintenance updateMaintenance(Long id, MaintenanceRequest request, User currentUser) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance non trouvée"));

        if (request.getType() != null) maintenance.setType(request.getType());
        if (request.getProblemDescription() != null) maintenance.setProblemDescription(request.getProblemDescription());
        if (request.getActionsPerformed() != null) maintenance.setActionsPerformed(request.getActionsPerformed());
        if (request.getInterventionDate() != null) maintenance.setInterventionDate(request.getInterventionDate());
        if (request.getDuration() != null) maintenance.setDuration(request.getDuration());
        if (request.getCost() != null) maintenance.setCost(request.getCost());
        if (request.getProvider() != null) maintenance.setProvider(request.getProvider());

        Maintenance saved = maintenanceRepository.save(maintenance);

        auditLogService.log(currentUser, "UPDATE", "Maintenance", id,
                "Modification de la maintenance #" + id);

        return saved;
    }

    // ========== CHANGEMENT DE STATUT ==========
    @Transactional
    public Maintenance startMaintenance(Long id, User currentUser) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance non trouvée"));
        maintenance.setStatus("EN_COURS");
        return maintenanceRepository.save(maintenance);
    }

    @Transactional
    public Maintenance completeMaintenance(Long id, String actionsPerformed, User currentUser) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance non trouvée"));

        maintenance.setStatus("TERMINE");
        if (actionsPerformed != null && !actionsPerformed.isEmpty()) {
            maintenance.setActionsPerformed(actionsPerformed);
        }

        Asset asset = maintenance.getAsset();
        if (asset.getStatus() == AssetStatus.EN_REPARATION) {
            asset.setStatus(AssetStatus.EN_STOCK);
            assetRepository.save(asset);
        }

        auditLogService.log(currentUser, "MAINTENANCE", "Maintenance", id,
                "Maintenance terminée sur " + asset.getType());

        return maintenanceRepository.save(maintenance);
    }

    // ========== SUPPRESSION ==========
    @Transactional
    public void deleteMaintenance(Long id, User currentUser) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance non trouvée"));

        auditLogService.log(currentUser, "DELETE", "Maintenance", id,
                "Suppression de la maintenance #" + id + " sur " + maintenance.getAsset().getType());

        maintenanceRepository.deleteById(id);
    }

    // ========== CONSULTATION ==========
    public Maintenance getMaintenanceById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance non trouvée"));
    }

    public List<Maintenance> getAssetMaintenances(Long assetId) {
        return maintenanceRepository.findByAssetId(assetId);
    }
}