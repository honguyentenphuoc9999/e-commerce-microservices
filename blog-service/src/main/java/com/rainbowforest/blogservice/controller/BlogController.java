package com.rainbowforest.blogservice.controller;

import com.rainbowforest.blogservice.entity.Article;
import com.rainbowforest.blogservice.entity.Comment;
import com.rainbowforest.blogservice.service.BlogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/")
public class BlogController {
    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    // Public endpoints
    @GetMapping("/articles")
    public ResponseEntity<?> getPublishedArticles(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(blogService.getPublishedArticlesPaginated(pageable));
    }

    @GetMapping("/articles/{id}")
    public Article getArticle(@PathVariable Long id) {
        return blogService.getArticleById(id);
    }

    @GetMapping("/articles/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return blogService.getPublishedCommentsByArticle(id);
    }

    @PostMapping("/articles/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody Comment comment) {
        comment.setArticleId(id);
        comment.setStatus(Comment.CommentStatus.PUBLISHED);
        return blogService.addComment(comment);
    }

    // Admin/User private endpoints
    // Admin Article endpoints
    @GetMapping("/admin/articles")
    public ResponseEntity<?> getAllArticles(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(blogService.getAllArticlesPaginated(pageable));
    }

    @PostMapping("/admin/articles")
    public Article createArticle(@RequestBody Article article) {
        return blogService.createArticle(article);
    }

    @PutMapping("/admin/articles/{id}")
    public Article updateArticle(@PathVariable Long id, @RequestBody Article article) {
        return blogService.updateArticle(id, article);
    }

    @DeleteMapping("/admin/articles/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        blogService.deleteArticle(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/articles/{id}/toggle")
    public Article toggleStatus(@PathVariable Long id) {
        return blogService.toggleStatus(id);
    }

    // Admin Comment endpoints
    @GetMapping("/admin/articles/{id}/comments")
    public List<Comment> getAdminComments(@PathVariable Long id) {
        return blogService.getAllCommentsByArticle(id);
    }

    @PostMapping("/admin/comments/{id}/toggle-visibility")
    public Comment toggleVisibility(@PathVariable Long id) {
        return blogService.toggleCommentVisibility(id);
    }

    @PostMapping("/admin/comments/{id}/pin")
    public Comment togglePin(@PathVariable Long id) {
        return blogService.togglePinComment(id);
    }

    // Common Comment endpoints
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, 
                                          @RequestParam String userId) {
        blogService.deleteComment(id, userId);
        return ResponseEntity.ok().build();
    }
}
