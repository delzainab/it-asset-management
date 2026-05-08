package com.example.itasset.controller;

import com.example.itasset.dto.ErrorResponse;
import com.example.itasset.model.Ticket;
import com.example.itasset.model.TicketComment;
import com.example.itasset.model.User;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    // ========== READ ==========
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/open")
    public ResponseEntity<List<Ticket>> getOpenTickets() {
        return ResponseEntity.ok(ticketService.getOpenTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // ========== CREATE ==========
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Ticket ticket,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Ticket created = ticketService.createTicket(ticket, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== UPDATE ==========
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @RequestBody Ticket ticket,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Ticket updated = ticketService.updateTicket(id, ticket, currentUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id,
                                               @RequestBody Map<String, String> request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request.get("status"), currentUser));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTicket(@PathVariable Long id,
                                               @RequestBody Map<String, Long> request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return ResponseEntity.ok(ticketService.assignTicket(id, request.get("technicianId"), currentUser));
    }

    // ========== DELETE ==========
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            ticketService.deleteTicket(id, currentUser);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Ticket supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ========== COMMENTS ==========
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id,
                                                    @RequestBody Map<String, String> request,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return ResponseEntity.ok(ticketService.addComment(id, request.get("message"), currentUser));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }
}