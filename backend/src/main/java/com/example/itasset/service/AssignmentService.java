package com.example.itasset.service;

import com.example.itasset.model.*;
import com.example.itasset.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Assignment assignAsset(Long assetId, Long userId, Long departmentId, String comment, User currentUser) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset non trouvé"));
        if (asset.getStatus() == AssetStatus.AFFECTE) {
            throw new RuntimeException("Cet asset est déjà affecté");
        }
        Assignment assignment = new Assignment();
        assignment.setAsset(asset);
        assignment.setType("AFFECTATION");
        assignment.setStartDate(LocalDateTime.now());
        assignment.setComment(comment);
        assignment.setCreatedAt(LocalDateTime.now());

        String assignedTo = "";
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            assignment.setUser(user);
            assignedTo = "utilisateur " + user.getFullName();
        }

        if (departmentId != null) {
            Department department = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new RuntimeException("Service non trouvé"));
            assignment.setDepartment(department);
            assignedTo = "service " + department.getName();
        }

        asset.setStatus(AssetStatus.AFFECTE);
        assetRepository.save(asset);

        Assignment saved = assignmentRepository.save(assignment);

        // Audit log
        auditLogService.log(currentUser, "ASSIGN", "Asset", assetId,
                "Affectation de " + asset.getType() + " " + asset.getBrand() + " " + asset.getModel() +
                        " à " + assignedTo + (comment.isEmpty() ? "" : " - Commentaire: " + comment));

        return saved;
    }

    @Transactional
    public Assignment returnAsset(Long assetId, String comment, User currentUser) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset non trouvé"));

        Assignment currentAssignment = assignmentRepository.findCurrentAssignmentByAssetId(assetId);
        if (currentAssignment == null) {
            throw new RuntimeException("Aucune affectation en cours pour cet asset");
        }

        currentAssignment.setEndDate(LocalDateTime.now());
        assignmentRepository.save(currentAssignment);

        Assignment restitution = new Assignment();
        restitution.setAsset(asset);
        restitution.setType("RESTITUTION");
        restitution.setStartDate(LocalDateTime.now());
        restitution.setEndDate(LocalDateTime.now());
        restitution.setComment(comment);
        restitution.setCreatedAt(LocalDateTime.now());

        asset.setStatus(AssetStatus.EN_STOCK);
        assetRepository.save(asset);

        Assignment saved = assignmentRepository.save(restitution);

        auditLogService.log(currentUser, "RETURN", "Asset", assetId,
                "Retour en stock de " + asset.getType() + " " + asset.getBrand() + " " + asset.getModel() +
                        (comment.isEmpty() ? "" : " - Commentaire: " + comment));

        return saved;
    }

    public List<Assignment> getAssetHistory(Long assetId) {
        return assignmentRepository.findByAssetOrderByCreatedAtDesc(
                assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("Asset non trouvé"))
        );
    }

    public List<Assignment> getCurrentAssignments() {
        return assignmentRepository.findCurrentAssignments();
    }

    public List<Assignment> getUserHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return assignmentRepository.findByUserOrderByCreatedAtDesc(user);
    }
}