package vn.uet.volunteerhub.domain.response.post;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class ResFetchPostDTO {
    private long id;
    private String content;
    private Instant createdAt;
    private String createdBy; // Tên người đăng
    private UserPost user; // Avatar/Info người đăng
    private List<CommentDTO> comments;
    private int totalLikes;
    private boolean isLikedByCurrentUser; // (Tùy chọn) Để hiện nút like xanh/đỏ

    @Getter
    @Setter
    public static class UserPost {
        private long id;
        private String name;
        private String email;
    }

    @Getter
    @Setter
    public static class CommentDTO {
        private long id;
        private String content;
        private Instant createdAt;
        private UserPost user;
    }
}