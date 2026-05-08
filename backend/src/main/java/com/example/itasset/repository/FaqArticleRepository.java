package com.example.itasset.repository;

import com.example.itasset.model.FaqArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FaqArticleRepository extends JpaRepository<FaqArticle, Long> {
    List<FaqArticle> findByCategory(String category);

    @Query("SELECT a FROM FaqArticle a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<FaqArticle> searchByKeyword(@Param("keyword") String keyword);
}