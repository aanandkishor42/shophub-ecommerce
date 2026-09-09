package com.shophub.service;

import com.shophub.dto.RegisterRequest;
import com.shophub.entity.Role;
import com.shophub.entity.User;
import com.shophub.exception.DuplicateResourceException;
import com.shophub.repository.RoleRepository;
import com.shophub.repository.UserRepository;
import com.shophub.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;
    @Mock private UserDetailsService userDetailsService;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    private RegisterRequest validRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setUsername("newuser");
        r.setEmail("new@test.com");
        r.setPassword("secret123");
        r.setFirstName("New");
        r.setLastName("User");
        return r;
    }

    @Test
    @DisplayName("Register returns token for a new unique user")
    void register_success() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(roleRepository.findByName(Role.RoleName.ROLE_USER))
                .thenReturn(Optional.of(new Role(Role.RoleName.ROLE_USER)));
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$hashed");
        when(userDetailsService.loadUserByUsername("newuser"))
                .thenReturn(mock(UserDetails.class));
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("jwt-token");

        var response = authService.register(validRequest());

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUsername()).isEqualTo("newuser");
        verify(userRepository).save(any(User.class));
        verify(emailService).sendWelcomeEmail("new@test.com", "New");
    }

    @Test
    @DisplayName("Register rejects a duplicate username")
    void register_duplicateUsername_throws() {
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Username already taken");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Register rejects a duplicate email")
    void register_duplicateEmail_throws() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email already registered");

        verify(userRepository, never()).save(any(User.class));
    }
}