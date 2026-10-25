package com.dinecity.wall;

import com.dinecity.wall.WallDtos.AreaView;
import com.dinecity.wall.WallDtos.GrantRequest;
import com.dinecity.wall.WallDtos.QuoteRequest;
import com.dinecity.wall.WallDtos.QuoteResponse;
import com.dinecity.wall.WallDtos.WallResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WallController {

    private final WallService service;

    public WallController(WallService service) {
        this.service = service;
    }

    // ----- public -----

    @GetMapping("/api/cities/{cityId}/wall")
    public WallResponse wall(@PathVariable Long cityId) {
        return service.wall(cityId);
    }

    @PostMapping("/api/cities/{cityId}/wall/quote")
    public QuoteResponse quote(@PathVariable Long cityId, @Valid @RequestBody QuoteRequest req) {
        return service.quote(cityId, req);
    }

    // ----- admin (role ADMIN, enforced in SecurityConfig) -----

    @PostMapping("/api/admin/wall/grants")
    @ResponseStatus(HttpStatus.CREATED)
    public AreaView grant(@Valid @RequestBody GrantRequest req) {
        return service.grant(req);
    }

    @DeleteMapping("/api/admin/wall/areas/{areaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void release(@PathVariable Long areaId) {
        service.release(areaId);
    }
}
