package com.example.itasset.repository;

import com.example.itasset.model.Asset;
import com.example.itasset.model.Assignment;
import com.example.itasset.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByAssetOrderByCreatedAtDesc(Asset asset);
    List<Assignment> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT a FROM Assignment a WHERE a.asset.id = :assetId AND a.type = 'AFFECTATION' AND a.endDate IS NULL")
    Assignment findCurrentAssignmentByAssetId(@Param("assetId") Long assetId);

    @Query("SELECT a FROM Assignment a WHERE a.type = 'AFFECTATION' AND a.endDate IS NULL")
    List<Assignment> findCurrentAssignments();
}