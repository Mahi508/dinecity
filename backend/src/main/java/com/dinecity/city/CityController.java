package com.dinecity.city;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CityController {

    public record CityResponse(Long id, String name, String state, String country) {
        static CityResponse from(City c) {
            return new CityResponse(c.getId(), c.getName(), c.getState(), c.getCountry());
        }
    }

    public record CityRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 100) String state,
            @Size(max = 100) String country) {
    }

    private final CityRepository cities;

    public CityController(CityRepository cities) {
        this.cities = cities;
    }

    /** Public: used by the directory filters and the owner form. */
    @GetMapping("/api/cities")
    public List<CityResponse> list() {
        return cities.findByActiveTrueOrderByNameAsc().stream().map(CityResponse::from).toList();
    }

    /** Admin only (see SecurityConfig). */
    @PostMapping("/api/admin/cities")
    @ResponseStatus(HttpStatus.CREATED)
    public CityResponse create(@Valid @RequestBody CityRequest req) {
        String name = req.name().trim();
        if (cities.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "City already exists");
        }
        String state = req.state() == null || req.state().isBlank() ? null : req.state().trim();
        return CityResponse.from(cities.save(new City(name, state, req.country())));
    }
}
