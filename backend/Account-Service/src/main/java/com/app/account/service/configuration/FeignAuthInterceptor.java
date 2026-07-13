package com.app.account.service.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

/**
 * Forwards the incoming JWT Bearer token from the current HTTP request
 * to all outbound Feign client calls (e.g., User-Service).
 *
 * Without this, Account-Service's Feign call to GET /api/users/{userId}
 * would be rejected with 401 because User-Service requires authentication.
 */
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                template.header("Authorization", authHeader);
            }
        }
    }
}
