package vn.uet.volunteerhub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.uet.volunteerhub.domain.Like;
import vn.uet.volunteerhub.service.LikeService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;
import vn.uet.volunteerhub.util.error.IdInvalidException;
import vn.uet.volunteerhub.util.error.PermissionException;

@RestController
@RequestMapping("/api/v1")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/posts/{postId}/likes")
    @ApiMessage("like a post")
    public ResponseEntity<Like> likePost(@PathVariable("postId") long postId)
            throws IdInvalidException, PermissionException {
        Like created = this.likeService.handleLikePost(postId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/comments/{commentId}/likes")
    @ApiMessage("like a comment")
    public ResponseEntity<Like> likeComment(@PathVariable("commentId") long commentId)
            throws IdInvalidException, PermissionException {
        Like created = this.likeService.handleLikeComment(commentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
