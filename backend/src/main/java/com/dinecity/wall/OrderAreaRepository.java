package com.dinecity.wall;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderAreaRepository extends JpaRepository<OrderArea, Long> {

    /**
     * Areas that share at least one pixel with the rectangle [x1,x2) x [y1,y2) at any moment
     * inside [start, end). endsAt == null means "forever".
     */
    @Query("""
            select a from OrderArea a
            where a.cityId = :cityId
              and a.status in :statuses
              and a.x < :x2 and a.x + a.width > :x1
              and a.y < :y2 and a.y + a.height > :y1
              and a.startsAt < :rangeEnd
              and (a.endsAt is null or a.endsAt > :rangeStart)
            """)
    List<OrderArea> findOverlapping(@Param("cityId") Long cityId,
                                    @Param("statuses") Collection<AreaStatus> statuses,
                                    @Param("x1") int x1, @Param("y1") int y1,
                                    @Param("x2") int x2, @Param("y2") int y2,
                                    @Param("rangeStart") Instant rangeStart, @Param("rangeEnd") Instant rangeEnd);

    /** Rows of [OrderArea, Business] for everything on the wall that has not ended yet. */
    @Query("""
            select a, b from OrderArea a, PixelOrder o, com.dinecity.business.Business b
            where a.orderId = o.id and o.businessId = b.id
              and a.cityId = :cityId
              and a.status in :statuses
              and (a.endsAt is null or a.endsAt > :now)
            order by a.id
            """)
    List<Object[]> findOnWall(@Param("cityId") Long cityId,
                              @Param("statuses") Collection<AreaStatus> statuses,
                              @Param("now") Instant now);
}
