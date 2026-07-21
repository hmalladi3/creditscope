package com.creditscope.backend.company;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID>, CompanyRepositoryCustom {
    Optional<Company> findByTicker(String ticker);
}
