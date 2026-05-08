package com.example.itasset.model;

public enum AssetCondition {
    NEUF("Neuf"),
    BON("Bon"),
    MOYEN("Moyen"),
    HS("Hors service"),
    REFORME("Réformé");

    private String displayName;

    AssetCondition(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}