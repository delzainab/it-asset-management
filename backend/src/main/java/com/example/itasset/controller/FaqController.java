package com.example.itasset.controller;

import com.example.itasset.dto.ErrorResponse;
import com.example.itasset.dto.FaqArticleRequest;
import com.example.itasset.model.FaqArticle;
import com.example.itasset.model.User;
import com.example.itasset.repository.UserRepository;
import com.example.itasset.service.FaqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faq")
@CrossOrigin(origins = "http://localhost:3000")
public class FaqController {

    @Autowired
    private FaqService faqService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<FaqArticle>> getAllArticles() {
        return ResponseEntity.ok(faqService.getAllArticles());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FaqArticle>> searchArticles(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(faqService.searchArticles(keyword));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FaqArticle>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(faqService.getArticlesByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqArticle> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.getArticleById(id));
    }

    @PostMapping
    public ResponseEntity<?> createArticle(@RequestBody FaqArticleRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            FaqArticle article = faqService.createArticle(request, currentUser);
            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id,
                                           @RequestBody FaqArticleRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            FaqArticle article = faqService.updateArticle(id, request, currentUser);
            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        try {
            faqService.deleteArticle(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Article supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
}