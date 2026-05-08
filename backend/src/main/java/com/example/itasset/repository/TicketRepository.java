package com.example.itasset.repository;

import com.example.itasset.model.Ticket;
import com.example.itasset.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(String status);
    List<Ticket> findByPriority(String priority);
    List<Ticket> findByAssignedTo(User user);
    List<Ticket> findByCreatedBy(User user);

    @Query("SELECT t FROM Ticket t WHERE t.status != 'FERME' ORDER BY t.createdAt DESC")
    List<Ticket> findOpenTickets();

    @Query("SELECT t FROM Ticket t WHERE t.priority = 'CRITIQUE' AND t.status != 'FERME'")
    List<Ticket> findCriticalTickets();
}