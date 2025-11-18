package vn.uet.volunteerhub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Comment;
import vn.uet.volunteerhub.service.CommentService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;
import vn.uet.volunteerhub.util.error.IdInvalidException;
import vn.uet.volunteerhub.util.error.PermissionException;

@RestController
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/posts/{postId}/comments")
    @ApiMessage("create comment for post")
    public ResponseEntity<Comment> createComment(@PathVariable("postId") long postId, @Valid @RequestBody Comment req)
            throws IdInvalidException, PermissionException {
        Comment created = this.commentService.handleCreateComment(postId, req.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
