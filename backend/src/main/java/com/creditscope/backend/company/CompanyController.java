package com.creditscope.backend.company;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// @spec API-BE-001, API-BE-009, API-BE-011, API-BE-012
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
            @RequestParam(required = false) String sort) {
        return companyService.list(page, size, sort);
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
}
