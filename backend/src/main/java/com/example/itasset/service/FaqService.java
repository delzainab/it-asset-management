package com.example.itasset.service;

import com.example.itasset.dto.FaqArticleRequest;
import com.example.itasset.model.FaqArticle;
import com.example.itasset.model.User;
import com.example.itasset.repository.FaqArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FaqService {

    @Autowired
    private FaqArticleRepository faqRepository;

    public List<FaqArticle> getAllArticles() {
        return faqRepository.findAll();
    }

    public FaqArticle getArticleById(Long id) {
        return faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article non trouvé"));
    }

    public List<FaqArticle> searchArticles(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllArticles();
        }
        return faqRepository.searchByKeyword(keyword);
    }

    public List<FaqArticle> getArticlesByCategory(String category) {
        return faqRepository.findByCategory(category);
    }

    public FaqArticle createArticle(FaqArticleRequest request, User author) {
        FaqArticle article = new FaqArticle();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        article.setCreatedBy(author);
        return faqRepository.save(article);
    }

    public FaqArticle updateArticle(Long id, FaqArticleRequest request, User editor) {
        FaqArticle article = getArticleById(id);
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setUpdatedAt(LocalDateTime.now());
        return faqRepository.save(article);
    }

    public void deleteArticle(Long id) {
        faqRepository.deleteById(id);
    }
}