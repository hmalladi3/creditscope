package com.creditscope.backend.rating;

import com.creditscope.backend.company.Company;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

// @spec API-DATA-002, API-DATA-003
@Entity
@Table(name = "rating")
public class Rating {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Grade grade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Outlook outlook;

    @Column(name = "rating_date", nullable = false)
    private LocalDate ratingDate;

    @Column(columnDefinition = "TEXT")
    private String rationale;

    protected Rating() {
    }

    public Rating(Company company, Grade grade, Outlook outlook, LocalDate ratingDate, String rationale) {
        this.company = company;
        this.grade = grade;
        this.outlook = outlook;
        this.ratingDate = ratingDate;
        this.rationale = rationale;
    }

    public UUID getId() {
        return id;
    }

    public Company getCompany() {
        return company;
    }

    public Grade getGrade() {
        return grade;
    }

    public Outlook getOutlook() {
        return outlook;
    }

    public LocalDate getRatingDate() {
        return ratingDate;
    }

    public String getRationale() {
        return rationale;
    }
}
