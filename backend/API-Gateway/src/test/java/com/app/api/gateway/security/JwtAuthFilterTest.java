package com.app.api.gateway.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

/** Checks who the gateway lets through, without starting the gateway. */
class JwtAuthFilterTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[32]); // 32 zero bytes, test only
    private final JwtAuthFilter filter = new JwtAuthFilter(SECRET);

    /** Runs the filter. Returns the request forwarded to the service, or null if it was blocked. */
    private ServerHttpRequest run(MockServerWebExchange exchange) {
        AtomicReference<ServerHttpRequest> forwarded = new AtomicReference<>();
        filter.filter(exchange, ex -> {
            forwarded.set(ex.getRequest());
            return Mono.empty();
        }).block();
        return forwarded.get();
    }

    private static String token(String secretBase64, Long uid) {
        Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretBase64));
        var builder = Jwts.builder().setSubject("a@b.c").setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60_000));
        if (uid != null) builder.claim("uid", uid);
        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    private static MockServerWebExchange call(HttpMethod method, String path, String bearer) {
        MockServerHttpRequest.BaseBuilder<?> req = MockServerHttpRequest.method(method, path);
        if (bearer != null) req.header("Authorization", "Bearer " + bearer);
        return MockServerWebExchange.from(req);
    }

    @Test
    void loginAndRegisterArePublic() {
        assertEquals("/api/auth/login", run(call(HttpMethod.POST, "/api/auth/login", null)).getURI().getPath());
        assertEquals("/api/auth/register", run(call(HttpMethod.POST, "/api/auth/register", null)).getURI().getPath());
    }

    @Test
    void everythingElseNeedsAToken() {
        MockServerWebExchange ex = call(HttpMethod.GET, "/accounts/user/5", null);
        assertNull(run(ex));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getResponse().getStatusCode());
    }

    @Test
    void forgedTokensAreRejected() {
        String otherSecret = Base64.getEncoder().encodeToString("x".repeat(32).getBytes());
        MockServerWebExchange ex = call(HttpMethod.GET, "/accounts/user/5", token(otherSecret, 5L));
        assertNull(run(ex));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getResponse().getStatusCode());
    }

    @Test
    void oldTokensWithoutAUserIdMustSignInAgain() {
        MockServerWebExchange ex = call(HttpMethod.GET, "/accounts/user/5", token(SECRET, null));
        assertNull(run(ex));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getResponse().getStatusCode());
    }

    @Test
    void aValidTokenIsForwardedWithTheTrustedUserId() {
        ServerHttpRequest forwarded = run(call(HttpMethod.GET, "/accounts/user/5", token(SECRET, 5L)));
        assertEquals("5", forwarded.getHeaders().getFirst(JwtAuthFilter.USER_HEADER));
    }

    @Test
    void aClientCannotChooseItsOwnUserId() {
        MockServerWebExchange ex = MockServerWebExchange.from(MockServerHttpRequest.get("/accounts/user/5")
                .header("Authorization", "Bearer " + token(SECRET, 5L))
                .header(JwtAuthFilter.USER_HEADER, "1"));
        assertEquals("5", run(ex).getHeaders().getFirst(JwtAuthFilter.USER_HEADER));

        // On public routes the spoofed header is simply removed.
        MockServerWebExchange pub = MockServerWebExchange.from(MockServerHttpRequest.post("/api/auth/login")
                .header(JwtAuthFilter.USER_HEADER, "1"));
        assertNull(run(pub).getHeaders().getFirst(JwtAuthFilter.USER_HEADER));
    }

    @Test
    void usersCanOnlyReachTheirOwnProfile() {
        assertEquals("/api/users/5", run(call(HttpMethod.GET, "/api/users/5", token(SECRET, 5L))).getURI().getPath());

        MockServerWebExchange ex = call(HttpMethod.PUT, "/api/users/6", token(SECRET, 5L));
        assertNull(run(ex));
        assertEquals(HttpStatus.FORBIDDEN, ex.getResponse().getStatusCode());
    }

    @Test
    void internalOnlyEndpointsAreHiddenEvenWithAValidToken() {
        String t = token(SECRET, 5L);
        for (Object[] c : new Object[][] {
                {HttpMethod.PUT, "/accounts"},
                {HttpMethod.PATCH, "/accounts"},
                {HttpMethod.POST, "/accounts/internal/transfer"},
                {HttpMethod.POST, "/accounts/internal/adjust"},
                {HttpMethod.POST, "/transactions/internal"},
                {HttpMethod.POST, "/sequence"},
                {HttpMethod.GET, "/api/users/ident/FIN2"},
                {HttpMethod.GET, "/api/users/accounts/ACC1"},
                {HttpMethod.PATCH, "/api/users/5"},
        }) {
            MockServerWebExchange ex = call((HttpMethod) c[0], (String) c[1], t);
            assertNull(run(ex), c[0] + " " + c[1] + " should be blocked");
            assertEquals(HttpStatus.NOT_FOUND, ex.getResponse().getStatusCode(), c[0] + " " + c[1]);
        }
    }

    @Test
    void closingAnAccountIsNotMistakenForTheBlockedBalanceOverwrite() {
        // PUT /accounts is internal-only, but PUT /accounts/closure is a normal user action.
        assertEquals("/accounts/closure",
                run(call(HttpMethod.PUT, "/accounts/closure?accountNumber=ACC1", token(SECRET, 5L))).getURI().getPath());
    }
}
