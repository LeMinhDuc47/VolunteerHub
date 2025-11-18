package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Post;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.post.ResFetchPostDTO;
import vn.uet.volunteerhub.repository.EventRepository;
import vn.uet.volunteerhub.repository.PostRepository;
import vn.uet.volunteerhub.repository.ResumeRepository;
import vn.uet.volunteerhub.repository.UserRepository;
import vn.uet.volunteerhub.util.SecurityUtil;
import vn.uet.volunteerhub.util.constant.ResumeStateEnum;
import vn.uet.volunteerhub.util.error.IdInvalidException;
import vn.uet.volunteerhub.util.error.PermissionException;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public PostService(PostRepository postRepository, EventRepository eventRepository, UserRepository userRepository,
            ResumeRepository resumeRepository) {
        this.postRepository = postRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }

    public Post handleCreatePost(long eventId, String content) throws IdInvalidException, PermissionException {
        Optional<Event> eventOpt = this.eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            throw new IdInvalidException("Event với id = " + eventId + " không tồn tại");
        }
        Event event = eventOpt.get();

        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        User user = this.userRepository.findByEmail(email);
        if (user == null) {
            throw new IdInvalidException("Người dùng hiện tại không tồn tại");
        }

        boolean isMemberApproved = this.resumeRepository
                .existsByUserIdAndJobEventIdAndStatus(user.getId(), eventId, ResumeStateEnum.APPROVED);
        if (!isMemberApproved) {
            throw new PermissionException("Bạn chưa là thành viên chính thức của sự kiện này.");
        }

        Post post = new Post();
        post.setContent(content);
        post.setEvent(event);
        post.setUser(user);
        return this.postRepository.save(post);
    }

    public List<Post> fetchPostsByEvent(long eventId) throws IdInvalidException {
        Optional<Event> eventOpt = this.eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            throw new IdInvalidException("Event với id = " + eventId + " không tồn tại");
        }
        Event event = eventOpt.get();
        return this.postRepository.findByEventOrderByCreatedAtDesc(event);
    }

    public List<ResFetchPostDTO> getPostsByEvent(long eventId) throws IdInvalidException {
        Event event = this.eventRepository.findById(eventId)
                .orElseThrow(() -> new IdInvalidException("Event với id = " + eventId + " không tồn tại"));

        List<Post> posts = this.postRepository.findByEventOrderByCreatedAtDesc(event);

        return posts.stream().map(post -> {
            ResFetchPostDTO dto = new ResFetchPostDTO();
            dto.setId(post.getId());
            dto.setContent(post.getContent());
            dto.setCreatedAt(post.getCreatedAt());
            dto.setCreatedBy(post.getCreatedBy());
            ResFetchPostDTO.UserPost u = new ResFetchPostDTO.UserPost();
            if (post.getUser() != null) {
                u.setId(post.getUser().getId());
                u.setName(post.getUser().getName());
                u.setEmail(post.getUser().getEmail());
            }
            dto.setUser(u);

            if (post.getComments() != null) {
                List<ResFetchPostDTO.CommentDTO> commentDTOs = post.getComments().stream().map(cmt -> {
                    ResFetchPostDTO.CommentDTO cDto = new ResFetchPostDTO.CommentDTO();
                    cDto.setId(cmt.getId());
                    cDto.setContent(cmt.getContent());
                    cDto.setCreatedAt(cmt.getCreatedAt());

                    ResFetchPostDTO.UserPost cu = new ResFetchPostDTO.UserPost();
                    if (cmt.getUser() != null) {
                        cu.setId(cmt.getUser().getId());
                        cu.setName(cmt.getUser().getName());
                    }
                    cDto.setUser(cu);
                    return cDto;
                }).collect(Collectors.toList());
                dto.setComments(commentDTOs);
            }

            dto.setTotalLikes(post.getLikes() != null ? post.getLikes().size() : 0);

            return dto;
        }).collect(Collectors.toList());
    }
}
