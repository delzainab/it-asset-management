package com.example.itasset.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MaintenanceRequest {
    private Long assetId;
    private String type;
    private String problemDescription;
    private String actionsPerformed;
    private LocalDate interventionDate;
    private Integer duration;
    private Double cost;
    private String provider;
}