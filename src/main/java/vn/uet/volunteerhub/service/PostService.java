package vn.uet.volunteerhub.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import java.util.List;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Post;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.repository.EventRepository;
import vn.uet.volunteerhub.repository.PostRepository;
import vn.uet.volunteerhub.repository.UserRepository;
import vn.uet.volunteerhub.util.SecurityUtil;
import vn.uet.volunteerhub.util.constant.EventStatusEnum;
import vn.uet.volunteerhub.util.error.IdInvalidException;
import vn.uet.volunteerhub.util.error.PermissionException;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, EventRepository eventRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Post handleCreatePost(long eventId, String content) throws IdInvalidException, PermissionException {
        Optional<Event> eventOpt = this.eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            throw new IdInvalidException("Event với id = " + eventId + " không tồn tại");
        }
        Event event = eventOpt.get();
        if (event.getStatus() != EventStatusEnum.APPROVED) {
            throw new PermissionException("Sự kiện chưa được duyệt. Không thể tạo bài viết.");
        }

        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        User user = this.userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Người dùng hiện tại không tồn tại");
        }

        Post post = new Post();
        post.setContent(content);
        post.setEvent(event);
        post.setUser(user);
        return this.postRepository.save(post);
    }

    public List<Post> fetchPostsByEvent(long eventId) throws IdInvalidException, PermissionException {
        Optional<Event> eventOpt = this.eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            throw new IdInvalidException("Event với id = " + eventId + " không tồn tại");
        }
        Event event = eventOpt.get();
        if (event.getStatus() != EventStatusEnum.APPROVED) {
            throw new PermissionException("Sự kiện chưa được duyệt. Không thể lấy danh sách bài viết.");
        }
        return this.postRepository.findByEventOrderByCreatedAtDesc(event);
    }
}
