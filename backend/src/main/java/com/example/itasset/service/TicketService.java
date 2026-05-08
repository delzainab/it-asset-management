package com.example.itasset.service;

import com.example.itasset.model.*;
import com.example.itasset.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AuditLogService auditLogService;

    // ========== READ ==========
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getOpenTickets() {
        return ticketRepository.findOpenTickets();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));
    }

    // ========== CREATE ==========
    @Transactional
    public Ticket createTicket(Ticket ticket, User creator) {
        ticket.setCreatedBy(creator);
        ticket.setStatus("OUVERT");
        ticket.setCreatedAt(LocalDateTime.now());

        if (ticket.getAsset() != null && ticket.getAsset().getId() != null) {
            Asset asset = assetRepository.findById(ticket.getAsset().getId())
                    .orElseThrow(() -> new RuntimeException("Asset non trouvé"));
            ticket.setAsset(asset);
        }

        Ticket saved = ticketRepository.save(ticket);

        auditLogService.log(creator, "CREATE", "Ticket", saved.getId(),
                "Création ticket: " + ticket.getTitle());

        return saved;
    }

    // ========== UPDATE ==========
    @Transactional
    public Ticket updateTicket(Long id, Ticket ticketDetails, User user) {
        Ticket ticket = getTicketById(id);

        ticket.setTitle(ticketDetails.getTitle());
        ticket.setDescription(ticketDetails.getDescription());
        ticket.setPriority(ticketDetails.getPriority());

        if (ticketDetails.getAsset() != null && ticketDetails.getAsset().getId() != null) {
            Asset asset = assetRepository.findById(ticketDetails.getAsset().getId())
                    .orElseThrow(() -> new RuntimeException("Asset non trouvé"));
            ticket.setAsset(asset);
        }

        Ticket saved = ticketRepository.save(ticket);

        auditLogService.log(user, "UPDATE", "Ticket", id,
                "Modification ticket: " + ticket.getTitle());

        return saved;
    }

    @Transactional
    public Ticket updateTicketStatus(Long id, String status, User user) {
        Ticket ticket = getTicketById(id);
        String oldStatus = ticket.getStatus();
        ticket.setStatus(status);

        if ("RESOLU".equals(status)) {
            ticket.setResolvedDate(LocalDateTime.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        auditLogService.log(user, "UPDATE", "Ticket", id,
                "Changement de statut: " + oldStatus + " → " + status);

        return saved;
    }

    @Transactional
    public Ticket assignTicket(Long id, Long technicianId, User user) {
        Ticket ticket = getTicketById(id);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technicien non trouvé"));

        ticket.setAssignedTo(technician);
        ticket.setStatus("EN_COURS");

        Ticket saved = ticketRepository.save(ticket);

        auditLogService.log(user, "ASSIGN", "Ticket", id,
                "Ticket assigné à " + technician.getFullName());

        return saved;
    }

    // ========== DELETE ==========
    @Transactional
    public void deleteTicket(Long id, User user) {
        Ticket ticket = getTicketById(id);

        // Supprimer d'abord les commentaires
        List<TicketComment> comments = commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
        commentRepository.deleteAll(comments);

        // Puis supprimer le ticket
        ticketRepository.deleteById(id);

        auditLogService.log(user, "DELETE", "Ticket", id,
                "Suppression ticket: " + ticket.getTitle());
    }

    // ========== COMMENTS ==========
    @Transactional
    public TicketComment addComment(Long ticketId, String message, User user) {
        Ticket ticket = getTicketById(ticketId);

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setMessage(message);
        comment.setCreatedAt(LocalDateTime.now());

        TicketComment saved = commentRepository.save(comment);

        auditLogService.log(user, "COMMENT", "Ticket", ticketId,
                "Ajout de commentaire sur le ticket \"" + ticket.getTitle() + "\"");

        return saved;
    }

    public List<TicketComment> getComments(Long ticketId) {
        Ticket ticket = getTicketById(ticketId);
        return commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
    }
}