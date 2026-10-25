package com.dinecity.business;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BusinessRepository extends JpaRepository<Business, Long>, JpaSpecificationExecutor<Business> {

    List<Business> findByOwnerIdOrderByIdDesc(Long ownerId);

    List<Business> findByStatusOrderByIdDesc(BusinessStatus status);
}
