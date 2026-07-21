package com.creditscope.backend.company;

import com.creditscope.backend.rating.Grade;
import org.springframework.data.domain.Page;

// @spec API-BE-003, API-BE-004, API-BE-005
public interface CompanyRepositoryCustom {
    Page<Company> search(String search, String sector, String country, Grade grade,
                          String sortField, boolean sortDesc, int pageNumberZeroBased, int pageSize);
}
