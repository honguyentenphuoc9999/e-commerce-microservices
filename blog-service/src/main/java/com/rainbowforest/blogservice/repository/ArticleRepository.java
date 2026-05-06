package com.rainbowforest.blogservice.repository;

import com.rainbowforest.blogservice.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findAllByOrderByCreatedAtDesc();
    Page<Article> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Article> findByStatusOrderByCreatedAtDesc(Article.ArticleStatus status);
    Page<Article> findByStatusOrderByCreatedAtDesc(Article.ArticleStatus status, Pageable pageable);
}
