package com.example.itasset.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "maintenances")
@Data
@NoArgsConstructor
public class Maintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(nullable = false)
    private String type;

    @Column(length = 1000)
    private String problemDescription;

    @Column(length = 1000)
    private String actionsPerformed;

    private LocalDate interventionDate;
    private Integer duration;

    private Double cost;
    private String provider;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}