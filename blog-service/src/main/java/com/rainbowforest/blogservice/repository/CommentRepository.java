package com.rainbowforest.blogservice.repository;

import com.rainbowforest.blogservice.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByArticleIdOrderByCreatedAtAsc(Long articleId);
    List<Comment> findByArticleIdAndStatusOrderByCreatedAtAsc(Long articleId, Comment.CommentStatus status);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByArticleId(Long articleId);
}
