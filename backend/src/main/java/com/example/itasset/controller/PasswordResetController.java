package com.example.itasset.controller;

import com.example.itasset.dto.ForgotPasswordRequest;
import com.example.itasset.dto.ResetPasswordRequest;
import com.example.itasset.dto.MessageResponse;
import com.example.itasset.dto.ErrorResponse;
import com.example.itasset.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.createResetToken(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Si votre email existe, vous recevrez un lien de réinitialisation"));
        } catch (Exception e) {
            return ResponseEntity.ok(new MessageResponse("Si votre email existe, vous recevrez un lien de réinitialisation"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Mot de passe réinitialisé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }
}