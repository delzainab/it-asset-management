package com.example.itasset.repository;

import com.example.itasset.model.Ticket;
import com.example.itasset.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketOrderByCreatedAtDesc(Ticket ticket);
}