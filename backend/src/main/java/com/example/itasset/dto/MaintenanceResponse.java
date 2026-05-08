package com.example.itasset.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceResponse {
    private Long id;
    private String assetName;
    private String assetSerial;
    private String technicianName;
    private String type;
    private String problemDescription;
    private String actionsPerformed;
    private LocalDateTime interventionDate;
    private Integer duration;
    private Double cost;
    private String provider;
    private String status;
    private LocalDateTime createdAt;
}