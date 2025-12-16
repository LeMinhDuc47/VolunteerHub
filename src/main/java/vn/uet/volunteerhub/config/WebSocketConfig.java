package vn.uet.volunteerhub.config;

import java.security.Principal;
import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.util.UriComponentsBuilder;

import vn.uet.volunteerhub.util.SecurityUtil;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String[] allowedOrigins;
    private final SecurityUtil securityUtil;

    public WebSocketConfig(
            @Value("${volunteerhub.websocket.allowed-origins:http://localhost:5173}") String allowedOrigins,
            SecurityUtil securityUtil) {
        this.allowedOrigins = allowedOrigins.split("\\s*,\\s*");
        this.securityUtil = securityUtil;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setHandshakeHandler(new JwtPrincipalHandshakeHandler(this.securityUtil))
                .setAllowedOriginPatterns(this.allowedOrigins)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user");
    }

    private static final class JwtPrincipalHandshakeHandler extends DefaultHandshakeHandler {
        private final SecurityUtil securityUtil;

        private JwtPrincipalHandshakeHandler(SecurityUtil securityUtil) {
            this.securityUtil = securityUtil;
        }

        @Override
        protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                Map<String, Object> attributes) {
            String token = this.resolveAccessToken(request);
            if (!StringUtils.hasText(token)) {
                throw new AuthenticationCredentialsNotFoundException("Missing access token");
            }

            try {
                Jwt jwt = this.securityUtil.decodeAccessToken(token);
                return new UsernamePasswordAuthenticationToken(
                        jwt.getSubject(),
                        null,
                        Collections.emptyList());
            } catch (Exception ex) {
                throw new AuthenticationCredentialsNotFoundException("Invalid access token", ex);
            }
        }

        private String resolveAccessToken(ServerHttpRequest request) {
            MultiValueMap<String, String> params = UriComponentsBuilder
                    .fromUri(request.getURI())
                    .build()
                    .getQueryParams();
            String token = params.getFirst("access_token");
            if (StringUtils.hasText(token)) {
                return token;
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
            return null;
        }
    }
}
