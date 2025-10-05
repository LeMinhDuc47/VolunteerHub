package vn.uet.volunteerhub.service;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.repository.UserRepository;

@Service
public class UserService {
    // Dependency Injection
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void handleCreateUser(User user) {
        this.userRepository.save(user);
    }
}