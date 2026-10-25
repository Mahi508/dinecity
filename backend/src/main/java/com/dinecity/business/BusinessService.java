package com.dinecity.business;

import com.dinecity.business.BusinessDtos.BusinessRequest;
import com.dinecity.business.BusinessDtos.BusinessResponse;
import com.dinecity.business.BusinessDtos.PageResponse;
import com.dinecity.city.City;
import com.dinecity.city.CityRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BusinessService {

    private static final int MAX_PAGE_SIZE = 50;

    private final BusinessRepository businesses;
    private final CityRepository cities;
    private final boolean autoApprove;

    public BusinessService(BusinessRepository businesses,
                           CityRepository cities,
                           @Value("${dinecity.business.auto-approve:true}") boolean autoApprove) {
        this.businesses = businesses;
        this.cities = cities;
        this.autoApprove = autoApprove;
    }

    // ---------- public directory ----------

    @Transactional(readOnly = true)
    public PageResponse<BusinessResponse> search(Long cityId, BusinessCategory category, String q, String cuisine,
                                                 int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by("name").ascending().and(Sort.by("id")));
        return PageResponse.from(businesses
                .findAll(BusinessSpecs.publicSearch(cityId, category, q, cuisine), pageable)
                .map(BusinessResponse::from));
    }

    /**
     * A business that is not APPROVED is visible only to its owner and to admins.
     * Everyone else gets a 404, so unapproved listings are not even confirmed to exist.
     */
    @Transactional(readOnly = true)
    public BusinessResponse get(Long id, Long viewerId, boolean viewerIsAdmin) {
        Business b = find(id);
        boolean visible = b.getStatus() == BusinessStatus.APPROVED
                || viewerIsAdmin
                || (viewerId != null && viewerId.equals(b.getOwnerId()));
        if (!visible) {
            throw notFound();
        }
        return BusinessResponse.from(b);
    }

    // ---------- owner ----------

    @Transactional
    public BusinessResponse create(Long ownerId, BusinessRequest req) {
        Business b = new Business(ownerId);
        apply(b, req);
        b.setStatus(autoApprove ? BusinessStatus.APPROVED : BusinessStatus.PENDING);
        return BusinessResponse.from(businesses.save(b));
    }

    @Transactional
    public BusinessResponse update(Long id, Long ownerId, BusinessRequest req) {
        Business b = find(id);
        if (!b.getOwnerId().equals(ownerId)) {
            // 404 rather than 403: do not reveal that someone else's business exists
            throw notFound();
        }
        apply(b, req);
        return BusinessResponse.from(b);
    }

    @Transactional(readOnly = true)
    public List<BusinessResponse> mine(Long ownerId) {
        return businesses.findByOwnerIdOrderByIdDesc(ownerId).stream().map(BusinessResponse::from).toList();
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<BusinessResponse> listByStatus(BusinessStatus status) {
        return businesses.findByStatusOrderByIdDesc(status).stream().map(BusinessResponse::from).toList();
    }

    @Transactional
    public BusinessResponse setStatus(Long id, BusinessStatus status) {
        Business b = find(id);
        b.setStatus(status);
        return BusinessResponse.from(b);
    }

    // ---------- helpers ----------

    private Business find(Long id) {
        return businesses.findById(id).orElseThrow(BusinessService::notFound);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found");
    }

    private void apply(Business b, BusinessRequest req) {
        City city = cities.findById(req.cityId())
                .filter(City::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown city"));
        b.setCity(city);
        b.setName(req.name().trim());
        b.setCategory(req.category());
        b.setCuisine(blankToNull(req.cuisine()));
        b.setDescription(blankToNull(req.description()));
        b.setAddress(req.address().trim());
        b.setLatitude(req.latitude());
        b.setLongitude(req.longitude());
        b.setPhone(blankToNull(req.phone()));
        b.setWebsiteUrl(blankToNull(req.websiteUrl()));
        b.setSocialLinks(cleanMap(req.socialLinks()));
        b.setOpeningHours(cleanMap(req.openingHours()));
        b.setLogoUrl(blankToNull(req.logoUrl()));
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static Map<String, String> cleanMap(Map<String, String> in) {
        Map<String, String> out = new HashMap<>();
        if (in != null) {
            in.forEach((k, v) -> {
                if (k != null && !k.isBlank() && v != null && !v.isBlank()) {
                    out.put(k.trim(), v.trim());
                }
            });
        }
        return out;
    }
}
