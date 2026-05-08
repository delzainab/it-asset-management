package com.example.itasset.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssignmentResponse {
    private Long id;
    private String assetName;
    private String userName;
    private String serviceName;
    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String comment;
}