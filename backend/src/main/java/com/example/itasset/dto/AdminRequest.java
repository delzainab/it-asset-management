package com.example.itasset.dto;

import lombok.Data;

@Data
public class AdminRequest {
    private String email;
    private String password;
    private String fullName;
    private Boolean deleteExisting;
}