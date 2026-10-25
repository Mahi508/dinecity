package com.dinecity.wall;

import com.dinecity.business.Business;
import com.dinecity.business.BusinessRepository;
import com.dinecity.business.BusinessStatus;
import com.dinecity.city.City;
import com.dinecity.city.CityRepository;
import com.dinecity.wall.WallDtos.AreaView;
import com.dinecity.wall.WallDtos.GrantRequest;
import com.dinecity.wall.WallDtos.QuoteRequest;
import com.dinecity.wall.WallDtos.QuoteResponse;
import com.dinecity.wall.WallDtos.WallResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * The server is the only authority on availability and price. The browser's idea of both is just a preview.
 */
@Service
public class WallService {

    /** Used as the end of the time window for permanent placements. */
    private static final Instant FOREVER = Instant.parse("9999-01-01T00:00:00Z");

    /** Statuses that occupy space on the wall. */
    private static final Set<AreaStatus> OCCUPYING = EnumSet.of(AreaStatus.HELD, AreaStatus.CONFIRMED);

    private final CityRepository cities;
    private final BusinessRepository businesses;
    private final OrderAreaRepository areas;
    private final PixelOrderRepository orders;
    private final int minSize;
    private final BigDecimal timedFractionPer30Days;

    public WallService(CityRepository cities,
                       BusinessRepository businesses,
                       OrderAreaRepository areas,
                       PixelOrderRepository orders,
                       @Value("${dinecity.wall.min-size:10}") int minSize,
                       @Value("${dinecity.wall.timed-fraction-per-30-days:0.10}") String timedFraction) {
        this.cities = cities;
        this.businesses = businesses;
        this.areas = areas;
        this.orders = orders;
        this.minSize = minSize;
        this.timedFractionPer30Days = new BigDecimal(timedFraction);
    }

    // ---------- public ----------

    @Transactional(readOnly = true)
    public WallResponse wall(Long cityId) {
        City city = city(cityId);
        List<AreaView> views = areas.findOnWall(cityId, OCCUPYING, Instant.now()).stream()
                .map(row -> toView((OrderArea) row[0], (Business) row[1]))
                .toList();
        return new WallResponse(city.getId(), city.getName(), city.getGridWidth(), city.getGridHeight(),
                city.getPricePerPixelPaise(), minSize, views);
    }

    @Transactional(readOnly = true)
    public QuoteResponse quote(Long cityId, QuoteRequest req) {
        City city = city(cityId);
        int x = req.x();
        int y = req.y();
        int w = req.width();
        int h = req.height();
        long pixels = WallMath.pixels(w, h);

        String problem = WallMath.validate(x, y, w, h, city.getGridWidth(), city.getGridHeight(), minSize);
        if (problem != null) {
            return new QuoteResponse(false, pixels, 0, problem);
        }
        if (req.purchaseType() == PurchaseType.TIMED && req.days() == null) {
            return new QuoteResponse(false, pixels, 0, "Choose how many days the campaign should run.");
        }

        long total = price(city, pixels, req.purchaseType(), req.days());
        boolean free = findConflicts(cityId, x, y, w, h, req.purchaseType(), req.days()).isEmpty();
        return new QuoteResponse(free, pixels, total,
                free ? "This area is available." : "Part of this area is already taken for that period.");
    }

    // ---------- admin ----------

    /**
     * Gives a business an area without payment (launch partners, tests). Uses the same availability
     * rules as a purchase will, and the database constraint backs them up.
     */
    @Transactional
    public AreaView grant(GrantRequest req) {
        Business business = businesses.findById(req.businessId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found"));
        if (business.getStatus() != BusinessStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved businesses can get a placement");
        }
        City city = city(business.getCity().getId());
        int x = req.x();
        int y = req.y();
        int w = req.width();
        int h = req.height();

        String problem = WallMath.validate(x, y, w, h, city.getGridWidth(), city.getGridHeight(), minSize);
        if (problem != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, problem);
        }
        if (req.purchaseType() == PurchaseType.TIMED && req.days() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "days is required for a timed placement");
        }
        if (!findConflicts(city.getId(), x, y, w, h, req.purchaseType(), req.days()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That area is already taken for that period");
        }

        Instant now = Instant.now();
        Instant endsAt = req.purchaseType() == PurchaseType.PERMANENT ? null : now.plus(req.days(), ChronoUnit.DAYS);
        PixelOrder order = orders.save(new PixelOrder(business.getId(), city.getId(), OrderStatus.PAID, 0, now));
        try {
            OrderArea area = areas.saveAndFlush(new OrderArea(order.getId(), city.getId(), x, y, w, h,
                    req.purchaseType(), now, endsAt, AreaStatus.CONFIRMED));
            return toView(area, business);
        } catch (DataIntegrityViolationException e) {
            // Lost a race with another purchase: the database refused the overlap.
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That area was just taken");
        }
    }

    @Transactional
    public void release(Long areaId) {
        OrderArea area = areas.findById(areaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Placement not found"));
        area.setStatus(AreaStatus.RELEASED);
    }

    // ---------- helpers ----------

    private City city(Long cityId) {
        return cities.findById(cityId)
                .filter(City::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "City not found"));
    }

    private List<OrderArea> findConflicts(Long cityId, int x, int y, int w, int h, PurchaseType type, Integer days) {
        Instant start = Instant.now();
        Instant end = type == PurchaseType.PERMANENT ? FOREVER : start.plus(days, ChronoUnit.DAYS);
        return areas.findOverlapping(cityId, OCCUPYING, x, y, x + w, y + h, start, end);
    }

    private long price(City city, long pixels, PurchaseType type, Integer days) {
        try {
            return type == PurchaseType.PERMANENT
                    ? WallMath.permanentPrice(pixels, city.getPricePerPixelPaise())
                    : WallMath.timedPrice(pixels, city.getPricePerPixelPaise(), timedFractionPer30Days, days);
        } catch (ArithmeticException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Area is too large");
        }
    }

    private static AreaView toView(OrderArea a, Business b) {
        boolean visible = b.getStatus() == BusinessStatus.APPROVED;
        return new AreaView(a.getId(), a.getX(), a.getY(), a.getWidth(), a.getHeight(),
                a.getPurchaseType(), a.getStatus(), a.getEndsAt(),
                visible ? b.getId() : null,
                visible ? b.getName() : "Reserved",
                visible ? b.getCategory() : null,
                visible ? b.getLogoUrl() : null);
    }
}
