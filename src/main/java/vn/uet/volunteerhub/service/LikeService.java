package vn.uet.volunteerhub.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Comment;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Like;
import vn.uet.volunteerhub.domain.Post;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.repository.CommentRepository;
import vn.uet.volunteerhub.repository.LikeRepository;
import vn.uet.volunteerhub.repository.PostRepository;
import vn.uet.volunteerhub.repository.UserRepository;
import vn.uet.volunteerhub.repository.ResumeRepository;
import vn.uet.volunteerhub.util.SecurityUtil;
import vn.uet.volunteerhub.util.constant.ResumeStateEnum;
import vn.uet.volunteerhub.util.error.IdInvalidException;
import vn.uet.volunteerhub.util.error.PermissionException;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public LikeService(LikeRepository likeRepository, PostRepository postRepository,
            CommentRepository commentRepository, UserRepository userRepository, ResumeRepository resumeRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }

    public Like handleLikePost(long postId) throws IdInvalidException, PermissionException {
        Optional<Post> postOpt = this.postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            throw new IdInvalidException("Post với id = " + postId + " không tồn tại");
        }
        Post post = postOpt.get();
        Event event = post.getEvent();
        if (event == null) {
            throw new IdInvalidException("Sự kiện cho bài viết không tồn tại");
        }

        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        User user = this.userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Người dùng hiện tại không tồn tại");
        }

        boolean isMemberApproved = this.resumeRepository
                .existsByUserIdAndJobEventIdAndStatus(user.getId(), event.getId(), ResumeStateEnum.APPROVED);
        if (!isMemberApproved) {
            throw new PermissionException("Bạn cần là thành viên chính thức của sự kiện để tham gia thảo luận.");
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        return this.likeRepository.save(like);
    }

    public Like handleLikeComment(long commentId) throws IdInvalidException, PermissionException {
        Optional<Comment> cmtOpt = this.commentRepository.findById(commentId);
        if (cmtOpt.isEmpty()) {
            throw new IdInvalidException("Comment với id = " + commentId + " không tồn tại");
        }
        Comment comment = cmtOpt.get();
        Post post = comment.getPost();
        Event event = post != null ? post.getEvent() : null;
        if (event == null) {
            throw new IdInvalidException("Sự kiện cho bình luận không tồn tại");
        }

        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        User user = this.userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Người dùng hiện tại không tồn tại");
        }

        boolean isMemberApproved = this.resumeRepository
                .existsByUserIdAndJobEventIdAndStatus(user.getId(), event.getId(), ResumeStateEnum.APPROVED);
        if (!isMemberApproved) {
            throw new PermissionException("Bạn cần là thành viên chính thức của sự kiện để tham gia thảo luận.");
        }

        Like like = new Like();
        like.setUser(user);
        like.setComment(comment);
        return this.likeRepository.save(like);
    }
}
