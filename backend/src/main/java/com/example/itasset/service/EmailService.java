package com.example.itasset.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("🔐 Réinitialisation mot de passe - Gestion Parc IT");
        message.setText(
                "Bonjour,\n\n" +
                        "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                        "Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:\n" +
                        frontendUrl + "/reset-password?token=" + token + "\n\n" +
                        "Ce lien est valable pendant 24 heures.\n\n" +
                        "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                        "Cordialement,\n" +
                        "L'équipe Gestion Parc IT"
        );
        mailSender.send(message);
    }
}