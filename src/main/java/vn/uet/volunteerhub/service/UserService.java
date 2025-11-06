package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.Meta;
import vn.uet.volunteerhub.domain.response.ResCreateUserDTO;
import vn.uet.volunteerhub.domain.response.ResUpdateUserDTO;
import vn.uet.volunteerhub.domain.response.ResUserDTO;
import vn.uet.volunteerhub.domain.response.ResultPaginationDTO;
import vn.uet.volunteerhub.repository.UserRepository;

@Service
public class UserService {

    private final EventService eventService;
    // Dependency Injection
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository, EventService eventService) {
        this.userRepository = userRepository;
        this.eventService = eventService;
    }

    public User handleCreateUser(User user) {
        // check event
        if (user.getEvent() != null) {
            Event event = this.eventService.fetchEventById(user.getEvent().getId());
            if (event != null) {
                user.setEvent(event);
            } else {
                user.setEvent(null);
            }
        }
        return this.userRepository.save(user);
    }

    public void handleDeleteUser(long id) {
        this.userRepository.deleteById(id);
    }

    public User fetchUserById(long id) {
        Optional<User> userOptional = this.userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }

    public ResultPaginationDTO fetchAllUsers(Specification<User> specification, Pageable pag) {
        Page<User> pUser = this.userRepository.findAll(specification, pag);
        ResultPaginationDTO result = new ResultPaginationDTO();
        Meta meta = new Meta();

        meta.setPage(pag.getPageNumber() + 1);
        meta.setPageSize(pag.getPageSize());

        meta.setPages(pUser.getTotalPages());
        meta.setTotal(pUser.getTotalElements());
        result.setMeta(meta);
        // remove sensitive data
        List<ResUserDTO> listUser = pUser.getContent()
                .stream().map(item -> new ResUserDTO(
                        item.getId(),
                        item.getName(),
                        item.getEmail(),
                        item.getAge(),
                        item.getAddress(),
                        item.getGender(),
                        item.getUpdatedAt(),
                        item.getCreatedAt(),
                        new ResUserDTO.EventUser(
                                item.getEvent() != null ? item.getEvent().getId() : 0,
                                item.getEvent() != null ? item.getEvent().getName() : null)))
                .collect(Collectors.toList());
        // Refactoring code
        // List<ResUserDTO> listUser = pUser.getContent()
        // .stream().map(this::convertToResUserDTO)
        // .collect(Collectors.toList());
        result.setResult(listUser);

        return result;
    }

    public User handleUpdateUser(User requestUser) {
        User currentUser = this.fetchUserById(requestUser.getId());
        if (currentUser != null) {
            currentUser.setAddress(requestUser.getAddress());
            currentUser.setName(requestUser.getName());
            currentUser.setGender(requestUser.getGender());
            currentUser.setAge(requestUser.getAge());
            // check event: If user change event
            if (requestUser.getEvent() != null) {
                Event eventOptional = this.eventService.fetchEventById(requestUser.getEvent().getId());
                currentUser.setEvent(eventOptional != null ? eventOptional : null);
            }
            // update
            currentUser = this.userRepository.save(currentUser);
        }
        return currentUser;
    }

    public User handleGetUserByUsername(String username) {
        return this.userRepository.findByEmail(username);
    }

    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO res = new ResCreateUserDTO();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setCreatedAt(user.getCreatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());
        return res;
    }

    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO res = new ResUserDTO();
        ResUserDTO.EventUser event = new ResUserDTO.EventUser();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setCreatedAt(user.getCreatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());
        if (user.getEvent() != null) {
            event.setId(user.getEvent().getId());
            event.setName(user.getEvent().getName());
            res.setEvent(event);
        }
        return res;
    }

    public ResUpdateUserDTO convertToResUpdateUserDTO(User user) {
        ResUpdateUserDTO res = new ResUpdateUserDTO();
        ResUpdateUserDTO.EventUser event = new ResUpdateUserDTO.EventUser();
        if (user.getEvent() != null) {
            event.setId(user.getEvent().getId());
            event.setName(user.getEvent().getName());
            res.setEvent(event);
        }
        res.setId(user.getId());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());

        return res;
    }

    public void updateUserToken(String token, String email) {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userRepository.findByRefreshTokenAndEmail(token, email);
    }
}