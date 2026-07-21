package com.creditscope.backend.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// @spec API-BE-011 (PUT)
public record CompanyUpdateDto(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "^[A-Za-z0-9.]{1,10}$", message = "ticker must be 1-10 alphanumeric characters") String ticker,
        @NotBlank String sector,
        @NotBlank String country,
        @Size(max = 4000) String description
) {
}
