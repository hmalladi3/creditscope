package com.creditscope.backend.company;

import com.creditscope.backend.rating.RatingCreateDto;
import com.creditscope.backend.rating.RatingDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// @spec API-BE-001, API-BE-009, API-BE-011, API-BE-012, API-BE-013, API-BE-014, API-BE-015
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public Page<CompanySummaryDto> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String grade) {
        return companyService.list(page, size, sort, search, sector, country, grade);
    }

    @GetMapping("/{id}")
    public CompanyDetailDto getById(@PathVariable UUID id) {
        return companyService.getById(id);
    }

    @PostMapping
    public ResponseEntity<CompanyDetailDto> create(@Valid @RequestBody CompanyCreateDto request) {
        CompanyDetailDto created = companyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public CompanyDetailDto update(@PathVariable UUID id, @Valid @RequestBody CompanyUpdateDto request) {
        return companyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ratings")
    public ResponseEntity<RatingDto> addRating(@PathVariable UUID id, @Valid @RequestBody RatingCreateDto request) {
        RatingDto created = companyService.addRating(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
