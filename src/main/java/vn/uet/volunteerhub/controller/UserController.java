package vn.uet.volunteerhub.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.service.UserService;

@RestController
public class UserController {
    // Dependency Injection
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user/create")
    public String createNewUser() {

        User user = new User();
        user.setEmail("test@gmail.com");
        user.setName("test");
        user.setPassword("123456");

        this.userService.handleCreateUser(user);

        return "create user";
    }
}