package com.rainbowforest.blogservice.service;

import com.rainbowforest.blogservice.entity.Article;
import com.rainbowforest.blogservice.entity.Comment;
import com.rainbowforest.blogservice.repository.ArticleRepository;
import com.rainbowforest.blogservice.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
public class BlogService {
    private final ArticleRepository articleRepository;
    private final CommentRepository commentRepository;

    public BlogService(ArticleRepository articleRepository, CommentRepository commentRepository) {
        this.articleRepository = articleRepository;
        this.commentRepository = commentRepository;
    }

    // Article operations
    public List<Article> getAllArticles() {
        return articleRepository.findAllByOrderByCreatedAtDesc();
    }

    public Page<Article> getAllArticlesPaginated(Pageable pageable) {
        return articleRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<Article> getPublishedArticles() {
        return articleRepository.findByStatusOrderByCreatedAtDesc(Article.ArticleStatus.PUBLISHED);
    }

    public Page<Article> getPublishedArticlesPaginated(Pageable pageable) {
        return articleRepository.findByStatusOrderByCreatedAtDesc(Article.ArticleStatus.PUBLISHED, pageable);
    }

    public Article getArticleById(Long id) {
        return articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    public Article updateArticle(Long id, Article articleDetails) {
        Article article = getArticleById(id);
        article.setTitle(articleDetails.getTitle());
        article.setSummary(articleDetails.getSummary());
        article.setContent(articleDetails.getContent());
        article.setThumbnailUrl(articleDetails.getThumbnailUrl());
        article.setStatus(articleDetails.getStatus());
        return articleRepository.save(article);
    }

    @Transactional
    public void deleteArticle(Long id) {
        commentRepository.deleteByArticleId(id);
        articleRepository.deleteById(id);
    }

    public Article toggleStatus(Long id) {
        Article article = getArticleById(id);
        article.setStatus(article.getStatus() == Article.ArticleStatus.PUBLISHED ? 
            Article.ArticleStatus.HIDDEN : Article.ArticleStatus.PUBLISHED);
        return articleRepository.save(article);
    }

    // Comment operations
    public List<Comment> getPublishedCommentsByArticle(Long articleId) {
        return commentRepository.findByArticleIdAndStatusOrderByCreatedAtAsc(articleId, Comment.CommentStatus.PUBLISHED);
    }

    public List<Comment> getAllCommentsByArticle(Long articleId) {
        return commentRepository.findByArticleIdOrderByCreatedAtAsc(articleId);
    }

    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public Comment toggleCommentVisibility(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (comment.getStatus() == Comment.CommentStatus.HIDDEN) {
            comment.setStatus(Comment.CommentStatus.PUBLISHED);
        } else {
            comment.setStatus(Comment.CommentStatus.HIDDEN);
            // If hidden, also unpin it
            comment.setPinned(false);
        }
        return commentRepository.save(comment);
    }

    public Comment togglePinComment(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // If we are pinning this comment, we must unpin all others for this article
        if (!comment.isPinned()) {
            List<Comment> allComments = commentRepository.findByArticleIdOrderByCreatedAtAsc(comment.getArticleId());
            for (Comment c : allComments) {
                if (c.isPinned()) {
                    c.setPinned(false);
                    commentRepository.save(c);
                }
            }
            comment.setPinned(true);
        } else {
            comment.setPinned(false);
        }
        
        return commentRepository.save(comment);
    }

    public Comment updateComment(Long id, String content, String userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        // Only author can update
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this comment");
        }
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id, String userId) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        commentRepository.deleteById(id);
    }
}
