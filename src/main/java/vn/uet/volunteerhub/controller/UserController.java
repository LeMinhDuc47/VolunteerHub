package vn.uet.volunteerhub.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.dto.ResCreateUserDTO;
import vn.uet.volunteerhub.domain.dto.ResUserDTO;
import vn.uet.volunteerhub.domain.dto.ResultPaginationDTO;
import vn.uet.volunteerhub.service.UserService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;
import vn.uet.volunteerhub.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class UserController {
    // Dependency Injection
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    @ApiMessage("Create a new user")
    public ResponseEntity<ResCreateUserDTO> createNewUser(@Valid @RequestBody User createUser)
            throws IdInvalidException {
        // check email exist in database
        boolean isEmailExist = this.userService.isEmailExist(createUser.getEmail());

        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + createUser.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }
        String hashPasword = this.passwordEncoder.encode(createUser.getPassword());
        createUser.setPassword(hashPasword);
        User newUser = this.userService.handleCreateUser(createUser);
        ResCreateUserDTO resCreateUserDTO = this.userService.convertToResCreateUserDTO(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(resCreateUserDTO);
    }

    @ApiMessage("Delete a user")
    public ResponseEntity<String> deleteUser(@PathVariable("id") long id) throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(id);
        if (currentUser == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }
        this.userService.handleDeleteUser(id);
        return ResponseEntity.ok("delete successful");
    }

    @GetMapping("/users/{id}")
    @ApiMessage("fetch user by id")
    public ResponseEntity<ResUserDTO> getUserById(@PathVariable("id") long id) throws IdInvalidException {
        User fetchUser = this.userService.fetchUserById(id);
        if (fetchUser == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }
        ResUserDTO responseUserDTO = this.userService.convertToResUserDTO(fetchUser);
        return ResponseEntity.status(HttpStatus.OK).body(responseUserDTO);
    }

    @GetMapping("/users")
    @ApiMessage("fetch all users")
    public ResponseEntity<ResultPaginationDTO> getAllUsers(@Filter Specification<User> spec, Pageable pageable) {

        return ResponseEntity.ok(this.userService.fetchAllUsers(spec, pageable));
    }

    @PutMapping("/users")
    public ResponseEntity<User> updateUser(@RequestBody User requestUser) {
        return ResponseEntity.ok(this.userService.handleUpdateUser(requestUser));
    }
}