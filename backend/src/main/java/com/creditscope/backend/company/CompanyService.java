package com.creditscope.backend.company;

import com.creditscope.backend.common.EntityNotFoundException;
import com.creditscope.backend.common.InvalidRequestException;
import com.creditscope.backend.rating.Grade;
import com.creditscope.backend.rating.Rating;
import com.creditscope.backend.rating.RatingCreateDto;
import com.creditscope.backend.rating.RatingDto;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

// @spec API-BE-001, API-BE-002, API-BE-003, API-BE-004, API-BE-005, API-BE-006, API-BE-007,
//       API-BE-008, API-BE-009, API-BE-010, API-BE-011, API-BE-012, API-BE-013, API-BE-014,
//       API-BE-015, API-DATA-001
@Service
@Transactional(readOnly = true)
public class CompanyService {

    private static final Set<String> SORTABLE_FIELDS = Set.of("name", "ticker", "sector", "currentGrade");
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
    }

    public Page<CompanySummaryDto> list(Integer page, Integer size, String sort,
                                         String search, String sector, String country, String grade) {
        int pageNum = page == null ? 1 : page;
        int pageSize = size == null ? DEFAULT_SIZE : size;
        if (pageNum < 1) {
            throw new InvalidRequestException("page must be 1 or greater");
        }
        if (pageSize < 1 || pageSize > MAX_SIZE) {
            throw new InvalidRequestException("size must be between 1 and " + MAX_SIZE);
        }

        String sortField = "name";
        boolean sortDesc = false;
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",", 2);
            sortField = parts[0];
            boolean desc = parts.length > 1 && "desc".equalsIgnoreCase(parts[1]);
            boolean ascExplicit = parts.length > 1 && "asc".equalsIgnoreCase(parts[1]);
            if (!SORTABLE_FIELDS.contains(sortField)) {
                throw new InvalidRequestException("sort field must be one of " + SORTABLE_FIELDS);
            }
            if (parts.length > 1 && !desc && !ascExplicit) {
                throw new InvalidRequestException("sort direction must be 'asc' or 'desc'");
            }
            sortDesc = desc;
        }

        Grade gradeFilter = parseGrade(grade);
        String normalizedSearch = blankToNull(search);
        String normalizedSector = blankToNull(sector);
        String normalizedCountry = blankToNull(country);

        Page<Company> page1 = companyRepository.search(
                normalizedSearch, normalizedSector, normalizedCountry, gradeFilter,
                sortField, sortDesc, pageNum - 1, pageSize);
        return page1.map(companyMapper::toSummary);
    }

    private Grade parseGrade(String grade) {
        if (grade == null || grade.isBlank()) {
            return null;
        }
        try {
            return Grade.valueOf(grade.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("grade must be one of " + java.util.Arrays.toString(Grade.values()));
        }
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    public CompanyDetailDto getById(UUID id) {
        return companyMapper.toDetail(findOrThrow(id));
    }

    private Company findOrThrow(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found: " + id));
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

    @Transactional
    public CompanyDetailDto update(UUID id, CompanyUpdateDto request) {
        Company company = findOrThrow(id);
        company.setName(request.name());
        company.setTicker(request.ticker().toUpperCase());
        company.setSector(request.sector());
        company.setCountry(request.country());
        company.setDescription(request.description());
        Company saved = companyRepository.saveAndFlush(company);
        return companyMapper.toDetail(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!companyRepository.existsById(id)) {
            throw new EntityNotFoundException("Company not found: " + id);
        }
        companyRepository.deleteById(id);
    }

    @Transactional
    public RatingDto addRating(UUID companyId, RatingCreateDto request) {
        Company company = findOrThrow(companyId);
        Rating rating = new Rating(company, request.grade(), request.outlook(), request.ratingDate(), request.rationale());
        company.getRatings().add(rating);
        companyRepository.saveAndFlush(company);
        return RatingDto.from(rating);
    }
}
