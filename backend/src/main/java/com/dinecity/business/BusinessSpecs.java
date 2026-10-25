package com.dinecity.business;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/** Builds the public directory search. Only APPROVED businesses are ever returned. */
public final class BusinessSpecs {

    private BusinessSpecs() {
    }

    public static Specification<Business> publicSearch(Long cityId, BusinessCategory category, String q, String cuisine) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), BusinessStatus.APPROVED));
            if (cityId != null) {
                predicates.add(cb.equal(root.get("city").get("id"), cityId));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + escapeLike(q.trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like, '\\'),
                        cb.like(cb.lower(root.get("cuisine")), like, '\\'),
                        cb.like(cb.lower(root.get("address")), like, '\\')));
            }
            if (cuisine != null && !cuisine.isBlank()) {
                String like = "%" + escapeLike(cuisine.trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.like(cb.lower(root.get("cuisine")), like, '\\'));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Stops users from using % and _ as wildcards in their search text. */
    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
