package com.app.api.gateway.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

/**
 * The gateway is the only door into the system from outside.
 *
 * <ul>
 *   <li>Internal-only endpoints (balance overwrite, sequence generator, user
 *       lookups used between services, ...) are refused outright.</li>
 *   <li>Login and register are public.</li>
 *   <li>Everything else needs a valid JWT signed by User-Service. The user id
 *       from the token is forwarded as {@value #USER_HEADER}; any value a client
 *       sends in that header is discarded first, so services can trust it.</li>
 * </ul>
 *
 * Services trust {@value #USER_HEADER} and skip ownership checks when it is
 * absent (service-to-service Feign calls). They must therefore only be
 * reachable through this gateway, never exposed directly.
 */
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    public static final String USER_HEADER = "X-Auth-User-Id";

    private static final Pattern USER_BY_ID = Pattern.compile("^/api/users/(\\d+)/?$");

    private final Key key;

    public JwtAuthFilter(@Value("${app.jwtSecret}") String jwtSecret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // Never let a client choose its own identity.
        ServerHttpRequest stripped = request.mutate()
                .headers(h -> h.remove(USER_HEADER))
                .build();

        if (method == HttpMethod.OPTIONS) {
            return chain.filter(exchange.mutate().request(stripped).build());
        }

        if (isInternalOnly(method, path)) {
            return reject(exchange, HttpStatus.NOT_FOUND, "Not found");
        }

        if (isPublic(method, path)) {
            return chain.filter(exchange.mutate().request(stripped).build());
        }

        String auth = request.getHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED, "Please sign in");
        }

        String userId;
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(auth.substring(7)).getBody();
            Object uid = claims.get("uid");
            if (uid == null) {
                // Tokens issued before this change have no user id: make them sign in again.
                return reject(exchange, HttpStatus.UNAUTHORIZED, "Session expired, please sign in again");
            }
            userId = String.valueOf(((Number) uid).longValue());
        } catch (JwtException | IllegalArgumentException | ClassCastException e) {
            return reject(exchange, HttpStatus.UNAUTHORIZED, "Session expired, please sign in again");
        }

        // A user may only read or edit their own profile.
        Matcher m = USER_BY_ID.matcher(path);
        if (m.matches() && !m.group(1).equals(userId)) {
            return reject(exchange, HttpStatus.FORBIDDEN, "You do not have access to this user");
        }

        ServerHttpRequest withUser = stripped.mutate().header(USER_HEADER, userId).build();
        return chain.filter(exchange.mutate().request(withUser).build());
    }

    private static boolean isPublic(HttpMethod method, String path) {
        return method == HttpMethod.POST
                && (path.equals("/api/auth/login") || path.equals("/api/auth/register"));
    }

    /** Endpoints that only other services may call. */
    private static boolean isInternalOnly(HttpMethod method, String path) {
        String p = path.endsWith("/") && path.length() > 1 ? path.substring(0, path.length() - 1) : path;

        if (p.equals("/sequence") || p.startsWith("/sequence/")) return true;
        if (p.startsWith("/accounts/internal")) return true;
        if (p.equals("/accounts") && (method == HttpMethod.PUT || method == HttpMethod.PATCH)) return true;
        if (p.equals("/transactions/internal")) return true;

        if (p.startsWith("/api/users/ident/")) return true;       // lookup by FIN id
        if (p.startsWith("/api/users/accounts/")) return true;    // lookup by account number
        if (p.startsWith("/api/users/") && method == HttpMethod.PATCH) return true; // status change
        return false;
    }

    private static Mono<Void> reject(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"message\":\"" + message + "\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
