package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Role;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.Meta;
import vn.uet.volunteerhub.domain.response.ResCreateUserDTO;
import vn.uet.volunteerhub.domain.response.ResUpdateUserDTO;
import vn.uet.volunteerhub.domain.response.ResUserDTO;
import vn.uet.volunteerhub.domain.response.ResultPaginationDTO;
import vn.uet.volunteerhub.repository.UserRepository;
import vn.uet.volunteerhub.util.error.IdInvalidException;

@Service
public class UserService {

    private final EventService eventService;
    // Dependency Injection
    private final UserRepository userRepository;
    private final RoleService roleService;

    public UserService(UserRepository userRepository, EventService eventService, RoleService roleService) {
        this.userRepository = userRepository;
        this.eventService = eventService;
        this.roleService = roleService;
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
        // check role
        if (user.getRole() != null) {
            Role role = this.roleService.fetchRoleById(user.getRole().getId());
            user.setRole(role != null ? role : null);
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
        // Refactoring code
        List<ResUserDTO> listUser = pUser.getContent()
                .stream().map(item -> this.convertToResUserDTO(item))
                .collect(Collectors.toList());
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
            // check role exist
            if (requestUser.getRole() != null) {
                Role role = this.roleService.fetchRoleById(requestUser.getRole().getId());
                currentUser.setRole(role != null ? role : null);
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
        ResCreateUserDTO.EventUser event = new ResCreateUserDTO.EventUser();
        ResCreateUserDTO.RoleUser role = new ResCreateUserDTO.RoleUser();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setCreatedAt(user.getCreatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());
        if (user.getEvent() != null) {
            event.setId(user.getEvent().getId());
            event.setName(user.getEvent().getName());
            res.setEvent(event);
        }

        if (user.getRole() != null) {
            role.setId(user.getRole().getId());
            role.setName(user.getRole().getName());
            res.setRole(role);
        }
        return res;
    }

    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO res = new ResUserDTO();
        ResUserDTO.EventUser event = new ResUserDTO.EventUser();
        ResUserDTO.RoleUser role = new ResUserDTO.RoleUser();
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
        if (user.getRole() != null) {
            role.setId(user.getRole().getId());
            role.setName(user.getRole().getName());
            res.setRole(role);
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
        ResUpdateUserDTO.RoleUser role = new ResUpdateUserDTO.RoleUser();
        if (user.getRole() != null) {
            role.setId(user.getRole().getId());
            role.setName(user.getRole().getName());

            res.setRole(role);
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

    public void handleChangePassword(String email, String currentPassword, String newPassword,
            PasswordEncoder passwordEncoder) throws IdInvalidException {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser == null) {
            throw new IdInvalidException("Tài khoản không tồn tại");
        }

        boolean isMatch = passwordEncoder.matches(currentPassword, currentUser.getPassword());
        if (!isMatch) {
            throw new IdInvalidException("Mật khẩu hiện tại không chính xác");
        }

        currentUser.setPassword(passwordEncoder.encode(newPassword));
        this.userRepository.save(currentUser);
    }
}