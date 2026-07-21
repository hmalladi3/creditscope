package com.creditscope.backend.company;

import com.creditscope.backend.common.EntityNotFoundException;
import com.creditscope.backend.common.InvalidRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

// @spec API-BE-001, API-BE-002, API-BE-006, API-BE-007, API-BE-008, API-BE-009, API-BE-010, API-BE-012, API-DATA-001
@Service
@Transactional(readOnly = true)
public class CompanyService {

    private static final Set<String> SORTABLE_FIELDS = Set.of("name", "ticker", "sector");
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
    }

    public Page<CompanySummaryDto> list(Integer page, Integer size, String sort) {
        int pageNum = page == null ? 1 : page;
        int pageSize = size == null ? DEFAULT_SIZE : size;
        if (pageNum < 1) {
            throw new InvalidRequestException("page must be 1 or greater");
        }
        if (pageSize < 1 || pageSize > MAX_SIZE) {
            throw new InvalidRequestException("size must be between 1 and " + MAX_SIZE);
        }
        Sort resolvedSort = resolveSort(sort).and(Sort.by("id").ascending());
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize, resolvedSort);
        return companyRepository.findAll(pageRequest).map(companyMapper::toSummary);
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by("name").ascending();
        }
        String[] parts = sort.split(",", 2);
        String field = parts[0];
        boolean desc = parts.length > 1 && "desc".equalsIgnoreCase(parts[1]);
        boolean ascExplicit = parts.length > 1 && "asc".equalsIgnoreCase(parts[1]);
        if (!SORTABLE_FIELDS.contains(field)) {
            throw new InvalidRequestException("sort field must be one of " + SORTABLE_FIELDS);
        }
        if (parts.length > 1 && !desc && !ascExplicit) {
            throw new InvalidRequestException("sort direction must be 'asc' or 'desc'");
        }
        return desc ? Sort.by(field).descending() : Sort.by(field).ascending();
    }

    public CompanyDetailDto getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found: " + id));
        return companyMapper.toDetail(company);
    }

    @Transactional
    public CompanyDetailDto create(CompanyCreateDto request) {
        Company company = new Company(
                request.name(), request.ticker().toUpperCase(), request.sector(),
                request.country(), request.description());
        // saveAndFlush (not save): forces the INSERT — and therefore the unique-ticker
        // constraint check — to execute synchronously within this request, instead of
        // being deferred to whenever Hibernate next flushes.
        Company saved = companyRepository.saveAndFlush(company);
        return companyMapper.toDetail(saved);
    }
}
