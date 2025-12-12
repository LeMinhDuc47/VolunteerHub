package vn.uet.volunteerhub.config;

import java.io.IOException;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import vn.uet.volunteerhub.domain.Role;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.ResLoginDTO;
import vn.uet.volunteerhub.domain.response.ResLoginDTO.UserLogin;
import vn.uet.volunteerhub.repository.RoleRepository;
import vn.uet.volunteerhub.repository.UserRepository;
import vn.uet.volunteerhub.util.SecurityUtil;
import vn.uet.volunteerhub.util.constant.AuthProviderEnum;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SecurityUtil securityUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.oauth2.default-role:USER}")
    private String defaultRoleName;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String frontendRedirectUri;

    public CustomOAuth2SuccessHandler(UserRepository userRepository, RoleRepository roleRepository,
            SecurityUtil securityUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.securityUtil = securityUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauth2Token)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Authentication type is not supported");
            return;
        }
        OAuth2User oAuth2User = oauth2Token.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        if (!StringUtils.hasText(email)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Không tìm thấy email Google cho tài khoản này");
            return;
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(resolveDisplayName(oAuth2User));
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setProvider(AuthProviderEnum.GOOGLE);
            user.setRole(resolveDefaultRole());
        } else if (user.getProvider() == null || user.getProvider() != AuthProviderEnum.GOOGLE) {
            user.setProvider(AuthProviderEnum.GOOGLE);
        }

        user = userRepository.save(user);

        ResLoginDTO res = new ResLoginDTO();
        UserLogin userLogin = res.new UserLogin();
        userLogin.setId(user.getId());
        userLogin.setEmail(user.getEmail());
        userLogin.setName(user.getName());
        userLogin.setRole(user.getRole());
        res.setUser(userLogin);

        String accessToken = securityUtil.createAccessToken(user.getEmail(), res);
        String redirectUri = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("token", accessToken)
                .build(true)
                .toUriString();
        response.sendRedirect(redirectUri);
    }

    private Role resolveDefaultRole() {
        Role role = roleRepository.findByName(defaultRoleName);
        return Objects.requireNonNull(role, () -> String
                .format("Role '%s' không tồn tại. Vui lòng tạo role mặc định trước khi dùng Google Login", defaultRoleName));
    }

    private String resolveDisplayName(OAuth2User user) {
        String name = user.getAttribute("name");
        if (StringUtils.hasText(name)) {
            return name;
        }
        String givenName = user.getAttribute("given_name");
        String familyName = user.getAttribute("family_name");
        return Stream.of(givenName, familyName)
                .filter(StringUtils::hasText)
                .reduce((a, b) -> a + " " + b)
                .orElse(emailFallback(user));
    }

    private String emailFallback(OAuth2User user) {
        String email = user.getAttribute("email");
        return StringUtils.hasText(email) ? email.split("@")[0] : "Google User";
    }
}
