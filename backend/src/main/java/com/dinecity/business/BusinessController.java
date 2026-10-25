package com.dinecity.business;

import com.dinecity.business.BusinessDtos.BusinessRequest;
import com.dinecity.business.BusinessDtos.BusinessResponse;
import com.dinecity.business.BusinessDtos.PageResponse;
import com.dinecity.business.BusinessDtos.StatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BusinessController {

    private final BusinessService service;

    public BusinessController(BusinessService service) {
        this.service = service;
    }

    // ----- public (no login needed) -----

    @GetMapping("/api/businesses")
    public PageResponse<BusinessResponse> search(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) BusinessCategory category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String cuisine,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return service.search(cityId, category, q, cuisine, page, size);
    }

    /** jwt is null for anonymous visitors. */
    @GetMapping("/api/businesses/{id}")
    public BusinessResponse get(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long viewerId = jwt == null ? null : Long.valueOf(jwt.getSubject());
        boolean admin = jwt != null && "ADMIN".equals(jwt.getClaimAsString("role"));
        return service.get(id, viewerId, admin);
    }

    // ----- owner (role OWNER, enforced in SecurityConfig) -----

    @PostMapping("/api/businesses")
    @ResponseStatus(HttpStatus.CREATED)
    public BusinessResponse create(@Valid @RequestBody BusinessRequest req, @AuthenticationPrincipal Jwt jwt) {
        return service.create(Long.valueOf(jwt.getSubject()), req);
    }

    @PutMapping("/api/businesses/{id}")
    public BusinessResponse update(@PathVariable Long id, @Valid @RequestBody BusinessRequest req,
                                   @AuthenticationPrincipal Jwt jwt) {
        return service.update(id, Long.valueOf(jwt.getSubject()), req);
    }

    @GetMapping("/api/owner/businesses")
    public List<BusinessResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return service.mine(Long.valueOf(jwt.getSubject()));
    }

    // ----- admin (role ADMIN, enforced in SecurityConfig) -----

    @GetMapping("/api/admin/businesses")
    public List<BusinessResponse> byStatus(@RequestParam(defaultValue = "PENDING") BusinessStatus status) {
        return service.listByStatus(status);
    }

    @PutMapping("/api/admin/businesses/{id}/status")
    public BusinessResponse setStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return service.setStatus(id, req.status());
    }
}
