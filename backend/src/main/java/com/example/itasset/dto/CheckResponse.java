package com.example.itasset.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CheckResponse {
    private Long rolesCount;
    private Long usersCount;
    private List<?> roles;
    private Boolean adminExists;
    private String adminEmail;
    private String adminName;
    private String adminRole;
}