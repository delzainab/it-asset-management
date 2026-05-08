package com.example.itasset.repository;

import com.example.itasset.model.Asset;
import com.example.itasset.model.AssetStatus;
import com.example.itasset.model.AssetCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySerialNumber(String serialNumber);
    Optional<Asset> findByInventoryCode(String inventoryCode);

    List<Asset> findByStatus(AssetStatus status);
    List<Asset> findByCondition(AssetCondition condition);
    List<Asset> findByTypeContainingIgnoreCase(String type);

    @Query("SELECT a FROM Asset a WHERE a.deleted = false")
    List<Asset> findAllActive();

    @Query("SELECT a FROM Asset a WHERE a.service.id = :serviceId")
    List<Asset> findByServiceId(@Param("serviceId") Long serviceId);

    @Query("SELECT a FROM Asset a WHERE a.office.id = :officeId")
    List<Asset> findByOfficeId(@Param("officeId") Long officeId);

    @Query("SELECT a FROM Asset a WHERE a.warrantyEndDate BETWEEN :start AND :end AND a.deleted = false")
    List<Asset> findWarrantyExpiringBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.type, COUNT(a) FROM Asset a WHERE a.deleted = false GROUP BY a.type")
    List<Object[]> countByType();

    @Query("SELECT a.status, COUNT(a) FROM Asset a WHERE a.deleted = false GROUP BY a.status")
    List<Object[]> countByStatus();
}