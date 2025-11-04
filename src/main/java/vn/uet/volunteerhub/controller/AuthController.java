package vn.uet.volunteerhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.dto.LoginDTO;
import vn.uet.volunteerhub.domain.dto.ResLoginDTO;
import vn.uet.volunteerhub.domain.dto.ResLoginDTO.UserLogin;
import vn.uet.volunteerhub.service.UserService;
import vn.uet.volunteerhub.util.SecurityUtil;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final SecurityUtil securityUtil;
    private final UserService userService;

    public AuthController(AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtil securityUtil,
            UserService userService) {
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtil = securityUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(), loginDTO.getPassword());

        // xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        // create token
        String access_token = this.securityUtil.createToken(authentication);
        // Set information to SecurityContextHolder
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Format response access_token
        ResLoginDTO res = new ResLoginDTO();
        // Query database để lấy thông tin user sau đó gán vào UserLogin
        User currentUserDB = this.userService.handleGetUserByUsername(loginDTO.getUsername());
        if (currentUserDB != null) {
            // Set Data into Inner class: UserLogin
            UserLogin resUserLogin = res.new UserLogin();

            resUserLogin.setId(currentUserDB.getId());
            resUserLogin.setEmail(currentUserDB.getEmail());
            resUserLogin.setName(currentUserDB.getName());

            res.setUser(resUserLogin);
        }
        res.setAccessToken(access_token);

        return ResponseEntity.ok().body(res);
    }
}