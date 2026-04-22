package com.rainbowforest.blogservice.repository;

import com.rainbowforest.blogservice.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findAllByOrderByCreatedAtDesc();
    List<Article> findByStatusOrderByCreatedAtDesc(Article.ArticleStatus status);
}
