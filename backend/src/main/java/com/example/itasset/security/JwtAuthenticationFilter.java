package com.example.itasset.security;

import com.example.itasset.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        System.out.println("=== JWT FILTER DEBUG ===");
        System.out.println("URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + authorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            System.out.println("Token extrait: " + jwt.substring(0, Math.min(jwt.length(), 50)) + "...");
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("Username extrait: " + username);
            } catch (Exception e) {
                System.out.println("Erreur extraction username: " + e.getMessage());
            }
        } else {
            System.out.println("Pas de header Authorization ou pas de Bearer");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            System.out.println("UserDetails chargé: " + userDetails.getUsername());
            System.out.println("Authorities: " + userDetails.getAuthorities());

            if (jwtUtil.validateToken(jwt, userDetails)) {
                System.out.println("Token VALIDE");
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("Token INVALIDE");
            }
        }

        filterChain.doFilter(request, response);
    }
}