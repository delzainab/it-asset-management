package com.example.itasset.model;

public enum AssetStatus {
    EN_STOCK("En stock"),
    AFFECTE("Affecté"),
    EN_REPARATION("En réparation"),
    SORTI("Sorti");

    private String displayName;

    AssetStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}