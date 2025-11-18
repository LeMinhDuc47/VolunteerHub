package vn.uet.volunteerhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Post;
import vn.uet.volunteerhub.domain.response.post.ResFetchPostDTO;
import vn.uet.volunteerhub.service.PostService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;
import vn.uet.volunteerhub.util.error.IdInvalidException;
import vn.uet.volunteerhub.util.error.PermissionException;

@RestController
@RequestMapping("/api/v1")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/events/{eventId}/posts")
    @ApiMessage("create post in event")
    public ResponseEntity<Post> createPost(@PathVariable("eventId") long eventId, @Valid @RequestBody Post req)
            throws IdInvalidException, PermissionException {
        Post created = this.postService.handleCreatePost(eventId, req.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/events/{eventId}/posts")
    @ApiMessage("fetch posts in event")
    public ResponseEntity<List<ResFetchPostDTO>> getPosts(@PathVariable("eventId") long eventId)
            throws IdInvalidException {
        List<ResFetchPostDTO> posts = this.postService.getPostsByEvent(eventId);
        return ResponseEntity.status(HttpStatus.OK).body(posts);
    }
}
