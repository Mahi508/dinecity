package com.dinecity.auth;

import com.dinecity.user.User;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final long ttlMinutes;

    public JwtService(JwtEncoder encoder, @Value("${dinecity.jwt.ttl-minutes:120}") long ttlMinutes) {
        this.encoder = encoder;
        this.ttlMinutes = ttlMinutes;
    }

    public String issue(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("dinecity")
                .issuedAt(now)
                .expiresAt(now.plus(ttlMinutes, ChronoUnit.MINUTES))
                .subject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
