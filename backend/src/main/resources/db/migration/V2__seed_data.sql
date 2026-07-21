-- Demo credentials (documented in README): admin/admin123, viewer/viewer123
INSERT INTO app_user (username, password_hash, role) VALUES
    ('admin', '$2a$10$3Q0tfIsa8YSIUlIJiaKfX.vVwM1BEt09z.dW9y5sPRsQeG96vyGU6', 'ADMIN'),
    ('viewer', '$2a$10$Kop4rXCoID4i5.8m4gfyIOFeeEki8Ve83aFg5vSYJlfPYfEi2Oycu', 'VIEWER');

INSERT INTO company (id, name, ticker, sector, country, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Acme Industrial Corp', 'ACME', 'Industrials', 'US', 'Diversified industrial manufacturer.'),
    ('11111111-1111-1111-1111-111111111102', 'Northwind Energy PLC', 'NWE', 'Energy', 'GB', 'Integrated oil and gas producer.'),
    ('11111111-1111-1111-1111-111111111103', 'Solara Technologies Inc', 'SOLA', 'Technology', 'US', 'Cloud infrastructure and software.'),
    ('11111111-1111-1111-1111-111111111104', 'Meridian Retail Group', 'MRG', 'Consumer Discretionary', 'US', 'Multi-brand apparel retailer.'),
    ('11111111-1111-1111-1111-111111111105', 'Baltic Shipping AS', 'BALT', 'Industrials', 'NO', 'Bulk and container shipping operator.'),
    ('11111111-1111-1111-1111-111111111106', 'Sakura Financial Group', 'SKFG', 'Financials', 'JP', 'Regional banking and insurance group.'),
    ('11111111-1111-1111-1111-111111111107', 'Iberia Telecom SA', 'IBTL', 'Communication Services', 'ES', 'Fixed-line and mobile network operator.'),
    ('11111111-1111-1111-1111-111111111108', 'Prairie Agri Holdings', 'PRAG', 'Consumer Staples', 'CA', 'Grain processing and distribution.'),
    ('11111111-1111-1111-1111-111111111109', 'Vantage Health Systems', 'VHS', 'Health Care', 'US', 'Hospital and outpatient care network.'),
    ('11111111-1111-1111-1111-111111111110', 'Copperline Mining Ltd', 'CPRL', 'Materials', 'AU', 'Base metals extraction and refining.'),
    ('11111111-1111-1111-1111-111111111111', 'Frontier Aerospace Co', 'FRAC', 'Industrials', 'US', 'Commercial aircraft components.'),
    ('11111111-1111-1111-1111-111111111112', 'Helvetia Insurance Group', 'HLVI', 'Financials', 'CH', 'Property and casualty insurer.'),
    ('11111111-1111-1111-1111-111111111113', 'Delta Semiconductor Inc', 'DSEM', 'Technology', 'US', 'Fabless chip designer.'),
    ('11111111-1111-1111-1111-111111111114', 'Riviera Hospitality SA', 'RIVH', 'Consumer Discretionary', 'FR', 'Hotel and resort operator.'),
    ('11111111-1111-1111-1111-111111111115', 'Cascade Utilities Corp', 'CASC', 'Utilities', 'US', 'Regulated electric and gas utility.'),
    ('11111111-1111-1111-1111-111111111116', 'Meru Logistics Ltd', 'MERU', 'Industrials', 'IN', 'Third-party logistics and freight.'),
    ('11111111-1111-1111-1111-111111111117', 'Nordic Paper AB', 'NRDP', 'Materials', 'SE', 'Sustainable pulp and paper producer.'),
    ('11111111-1111-1111-1111-111111111118', 'Zenith Media Holdings', 'ZNTH', 'Communication Services', 'US', 'Broadcast and streaming media.');

-- Rating history: each company gets 2-4 ratings over time, most recent last (feeds the trend chart).
INSERT INTO rating (company_id, grade, outlook, rating_date, rationale) VALUES
    ('11111111-1111-1111-1111-111111111101', 'BBB', 'STABLE', '2023-03-10', 'Stable industrial demand, moderate leverage.'),
    ('11111111-1111-1111-1111-111111111101', 'BBB', 'POSITIVE', '2024-09-15', 'Improving margins on cost discipline.'),
    ('11111111-1111-1111-1111-111111111101', 'A', 'STABLE', '2026-02-01', 'Upgraded on sustained deleveraging.'),

    ('11111111-1111-1111-1111-111111111102', 'BB', 'NEGATIVE', '2023-05-20', 'Elevated commodity price exposure.'),
    ('11111111-1111-1111-1111-111111111102', 'B', 'NEGATIVE', '2024-11-02', 'Downgraded on weak cash flow coverage.'),

    ('11111111-1111-1111-1111-111111111103', 'A', 'STABLE', '2023-01-18', 'Strong recurring revenue base.'),
    ('11111111-1111-1111-1111-111111111103', 'A', 'POSITIVE', '2024-06-30', 'Accelerating cloud migration demand.'),
    ('11111111-1111-1111-1111-111111111103', 'AA', 'STABLE', '2025-12-05', 'Upgraded on market leadership and scale.'),

    ('11111111-1111-1111-1111-111111111104', 'BB', 'STABLE', '2023-07-11', 'Cyclical retail exposure, adequate liquidity.'),
    ('11111111-1111-1111-1111-111111111104', 'BB', 'NEGATIVE', '2025-04-22', 'Softening discretionary spending trends.'),

    ('11111111-1111-1111-1111-111111111105', 'BBB', 'STABLE', '2023-02-14', 'Diversified route network.'),
    ('11111111-1111-1111-1111-111111111105', 'BBB', 'STABLE', '2024-08-19', 'Freight rates normalized as expected.'),

    ('11111111-1111-1111-1111-111111111106', 'A', 'STABLE', '2023-04-03', 'Well-capitalized regional franchise.'),
    ('11111111-1111-1111-1111-111111111106', 'A', 'STABLE', '2025-01-27', 'Consistent asset quality metrics.'),

    ('11111111-1111-1111-1111-111111111107', 'BBB', 'NEGATIVE', '2023-09-09', 'Competitive pressure on subscriber base.'),
    ('11111111-1111-1111-1111-111111111107', 'BB', 'STABLE', '2025-03-16', 'Downgraded following pricing pressure.'),

    ('11111111-1111-1111-1111-111111111108', 'BBB', 'STABLE', '2023-06-25', 'Stable grain volumes, diversified customers.'),

    ('11111111-1111-1111-1111-111111111109', 'A', 'STABLE', '2023-08-08', 'Essential-services demand profile.'),
    ('11111111-1111-1111-1111-111111111109', 'A', 'POSITIVE', '2024-12-12', 'Margin expansion from operating efficiencies.'),
    ('11111111-1111-1111-1111-111111111109', 'AA', 'STABLE', '2026-01-20', 'Upgraded on sector-leading profitability.'),

    ('11111111-1111-1111-1111-111111111110', 'B', 'NEGATIVE', '2023-10-30', 'High leverage amid soft metals prices.'),
    ('11111111-1111-1111-1111-111111111110', 'CCC', 'NEGATIVE', '2025-05-14', 'Downgraded on liquidity concerns.'),

    ('11111111-1111-1111-1111-111111111111', 'BBB', 'STABLE', '2023-11-21', 'Solid orderbook, moderate cyclicality.'),
    ('11111111-1111-1111-1111-111111111111', 'A', 'STABLE', '2025-07-08', 'Upgraded on backlog growth and margins.'),

    ('11111111-1111-1111-1111-111111111112', 'AA', 'STABLE', '2023-12-04', 'Strong capitalization, diversified book.'),

    ('11111111-1111-1111-1111-111111111113', 'BB', 'POSITIVE', '2024-02-17', 'Design wins support growth outlook.'),
    ('11111111-1111-1111-1111-111111111113', 'BBB', 'STABLE', '2025-09-25', 'Upgraded on diversified customer base.'),

    ('11111111-1111-1111-1111-111111111114', 'B', 'NEGATIVE', '2024-03-29', 'Discretionary travel demand headwinds.'),

    ('11111111-1111-1111-1111-111111111115', 'A', 'STABLE', '2024-04-13', 'Regulated, predictable cash flows.'),
    ('11111111-1111-1111-1111-111111111115', 'A', 'STABLE', '2025-11-19', 'Rate case outcome supportive of credit profile.'),

    ('11111111-1111-1111-1111-111111111116', 'BB', 'STABLE', '2024-05-05', 'Growing logistics volumes, thin margins.'),

    ('11111111-1111-1111-1111-111111111117', 'BBB', 'POSITIVE', '2024-07-22', 'Sustainability positioning aids demand.'),
    ('11111111-1111-1111-1111-111111111117', 'BBB', 'POSITIVE', '2025-10-02', 'Continued pricing power in specialty grades.'),

    ('11111111-1111-1111-1111-111111111118', 'CCC', 'NEGATIVE', '2024-10-08', 'Structural decline in broadcast revenue.'),
    ('11111111-1111-1111-1111-111111111118', 'CC', 'NEGATIVE', '2026-03-01', 'Further downgraded on refinancing risk.');
