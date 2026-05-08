package com.example.itasset.dto;

import lombok.Data;

@Data
public class FaqArticleRequest {
    private String title;
    private String content;
    private String category;
}