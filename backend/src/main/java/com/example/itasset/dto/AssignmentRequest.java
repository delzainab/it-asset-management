package com.example.itasset.dto;

import lombok.Data;

@Data
public class AssignmentRequest {
    private Long assetId;
    private Long userId;
    private Long serviceId;
    private String comment;
}