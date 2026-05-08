package com.example.itasset.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String brand;
    private String model;

    @Column(unique = true)
    private String serialNumber;

    @Column(unique = true)
    private String inventoryCode;

    private LocalDate purchaseDate;
    private LocalDate warrantyEndDate;

    @Column(name = "asset_condition")
    private AssetCondition condition;

    @Column(name = "asset_status")
    private AssetStatus status;

    @ManyToOne
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Department service;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean deleted = false;

    private String attachmentPath;

    public Asset() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getInventoryCode() { return inventoryCode; }
    public void setInventoryCode(String inventoryCode) { this.inventoryCode = inventoryCode; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public LocalDate getWarrantyEndDate() { return warrantyEndDate; }
    public void setWarrantyEndDate(LocalDate warrantyEndDate) { this.warrantyEndDate = warrantyEndDate; }

    public AssetCondition getCondition() { return condition; }
    public void setCondition(AssetCondition condition) { this.condition = condition; }

    public AssetStatus getStatus() { return status; }
    public void setStatus(AssetStatus status) { this.status = status; }

    public Office getOffice() { return office; }
    public void setOffice(Office office) { this.office = office; }

    public Department getService() { return service; }
    public void setService(Department service) { this.service = service; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
}