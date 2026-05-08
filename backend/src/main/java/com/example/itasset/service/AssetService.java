package com.example.itasset.service;

import com.example.itasset.model.*;
import com.example.itasset.repository.AssetRepository;
import com.example.itasset.repository.OfficeRepository;
import com.example.itasset.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private OfficeRepository officeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Transactional
    public Asset createAsset(Asset asset, User currentUser) {
        if (assetRepository.findBySerialNumber(asset.getSerialNumber()).isPresent()) {
            throw new RuntimeException("Numéro de série déjà existant");
        }
        if (assetRepository.findByInventoryCode(asset.getInventoryCode()).isPresent()) {
            throw new RuntimeException("Code inventaire déjà existant");
        }
        if (asset.getOffice() != null && asset.getOffice().getId() != null) {
            Office office = officeRepository.findById(asset.getOffice().getId())
                    .orElseThrow(() -> new RuntimeException("Bureau non trouvé"));
            asset.setOffice(office);
        }
        if (asset.getService() != null && asset.getService().getId() != null) {
            Department department = departmentRepository.findById(asset.getService().getId())
                    .orElseThrow(() -> new RuntimeException("Service non trouvé"));
            asset.setService(department);
        }

        asset.setCreatedAt(LocalDateTime.now());
        asset.setDeleted(false);
        Asset saved = assetRepository.save(asset);

        auditLogService.log(currentUser, "CREATE", "Asset", saved.getId(),
                "Création: " + asset.getType() + " " + asset.getBrand() + " " + asset.getModel() +
                        " (Série: " + asset.getSerialNumber() + ", Code: " + asset.getInventoryCode() + ")");

        return saved;
    }

    @Transactional
    public Asset updateAsset(Long id, Asset assetDetails, User currentUser) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset non trouvé"));

        String oldValue = asset.getType() + " - " + asset.getBrand() + " " + asset.getModel();

        if (assetDetails.getType() != null) asset.setType(assetDetails.getType());
        if (assetDetails.getBrand() != null) asset.setBrand(assetDetails.getBrand());
        if (assetDetails.getModel() != null) asset.setModel(assetDetails.getModel());
        if (assetDetails.getPurchaseDate() != null) asset.setPurchaseDate(assetDetails.getPurchaseDate());
        if (assetDetails.getWarrantyEndDate() != null) asset.setWarrantyEndDate(assetDetails.getWarrantyEndDate());
        if (assetDetails.getCondition() != null) asset.setCondition(assetDetails.getCondition());
        if (assetDetails.getStatus() != null) asset.setStatus(assetDetails.getStatus());

        if (assetDetails.getOffice() != null) {
            if (assetDetails.getOffice().getId() != null) {
                Office office = officeRepository.findById(assetDetails.getOffice().getId())
                        .orElseThrow(() -> new RuntimeException("Bureau non trouvé"));
                asset.setOffice(office);
            } else {
                asset.setOffice(null);
            }
        }

        if (assetDetails.getService() != null) {
            if (assetDetails.getService().getId() != null) {
                Department department = departmentRepository.findById(assetDetails.getService().getId())
                        .orElseThrow(() -> new RuntimeException("Service non trouvé"));
                asset.setService(department);
            } else {
                asset.setService(null);
            }
        }

        Asset updated = assetRepository.save(asset);

        auditLogService.log(currentUser, "UPDATE", "Asset", id,
                "Modification: " + oldValue + " → " + asset.getType() + " " + asset.getBrand() + " " + asset.getModel());

        return updated;
    }

    @Transactional
    public void deleteAsset(Long id, User currentUser) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset non trouvé"));
        if (asset.getStatus() == AssetStatus.AFFECTE) {
            throw new RuntimeException("Impossible de supprimer un asset affecté. Retournez-le en stock d'abord.");
        }
        asset.setDeleted(true);
        assetRepository.save(asset);

        // Audit log
        auditLogService.log(currentUser, "DELETE", "Asset", id,
                "Suppression: " + asset.getType() + " " + asset.getBrand() + " " + asset.getModel() +
                        " (Série: " + asset.getSerialNumber() + ")");
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAllActive();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset non trouvé"));
    }

    public List<Asset> searchAssets(String query) {
        return assetRepository.findByTypeContainingIgnoreCase(query);
    }

    public List<Asset> getWarrantyExpiringSoon(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusDays(days);
        return assetRepository.findWarrantyExpiringBetween(now.toLocalDate(), end.toLocalDate());
    }

    public List<Object[]> getStatsByType() {
        return assetRepository.countByType();
    }

    public List<Object[]> getStatsByStatus() {
        return assetRepository.countByStatus();
    }
}