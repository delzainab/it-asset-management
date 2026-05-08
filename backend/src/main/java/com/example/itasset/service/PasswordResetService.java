package com.example.itasset.service;

import com.example.itasset.model.PasswordResetToken;
import com.example.itasset.model.User;
import com.example.itasset.repository.PasswordResetTokenRepository;
import com.example.itasset.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void createResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email non trouvé"));

        tokenRepository.deleteByUser(user);

        PasswordResetToken token = new PasswordResetToken(user);
        tokenRepository.save(token);

        emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expiré");
        }

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token déjà utilisé");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.getExpiryDate().isBefore(LocalDateTime.now()) && !t.isUsed())
                .orElse(false);
    }
}