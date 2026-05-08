package com.example.itasset.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Column(nullable = false)
    private String status; // "OUVERT", "EN_COURS", "RESOLU", "FERME"

    @Column(nullable = false)
    private String priority; // "CRITIQUE", "ELEVEE", "MOYENNE", "BASSE"

    private LocalDateTime resolvedDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}