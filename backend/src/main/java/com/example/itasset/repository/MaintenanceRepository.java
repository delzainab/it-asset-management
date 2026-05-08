package com.example.itasset.repository;

import com.example.itasset.model.Asset;
import com.example.itasset.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByAssetOrderByCreatedAtDesc(Asset asset);

    @Query("SELECT m FROM Maintenance m WHERE m.asset.id = :assetId ORDER BY m.createdAt DESC")
    List<Maintenance> findByAssetId(@Param("assetId") Long assetId);

    @Query("SELECT m FROM Maintenance m WHERE m.status = 'PLANIFIE'")
    List<Maintenance> findPlannedMaintenances();

    @Query("SELECT m FROM Maintenance m WHERE m.status = 'EN_COURS'")
    List<Maintenance> findInProgressMaintenances();

    @Query("SELECT m.type, COUNT(m) FROM Maintenance m GROUP BY m.type")
    List<Object[]> countByType();
}