package com.creditscope.backend.company;

import com.creditscope.backend.rating.Rating;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// @spec API-DATA-001, API-DATA-005
@Entity
@Table(name = "company")
public class Company {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 10, unique = true)
    private String ticker;

    @Column(nullable = false)
    private String sector;

    @Column(nullable = false)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    // @spec API-BE-009 (history ordered by rating_date), API-DATA-004 (current = last element)
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ratingDate ASC, id ASC")
    private List<Rating> ratings = new ArrayList<>();

    protected Company() {
    }

    public Company(String name, String ticker, String sector, String country, String description) {
        this.name = name;
        this.ticker = ticker;
        this.sector = sector;
        this.country = country;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Rating> getRatings() {
        return ratings;
    }
}
