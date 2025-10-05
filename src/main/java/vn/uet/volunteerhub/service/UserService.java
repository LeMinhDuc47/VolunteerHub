package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;

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

    public User handleCreateUser(User user) {
        return this.userRepository.save(user);
    }

    public void handleDeleteUser(long id) {
        this.userRepository.deleteById(id);
    }

    public User fetchUserById(long id) {
        Optional<User> userOptional = this.userRepository.findById(id);
        User user = userOptional.isPresent() ? userOptional.get() : new User();
        return user;
    }

    public List<User> fetchAllUsers() {
        return this.userRepository.findAll();
    }

    public User handleUpdateUser(User requestUser) {
        User currentUser = this.fetchUserById(requestUser.getId());
        if (currentUser != null) {
            currentUser.setName(requestUser.getName());
            currentUser.setEmail(requestUser.getEmail());
            currentUser.setPassword(requestUser.getPassword());

            // update
            currentUser = this.userRepository.save(currentUser);
        }
        return currentUser;
    }
}