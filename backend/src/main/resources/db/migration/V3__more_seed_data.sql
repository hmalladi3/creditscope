-- Expands the seed set for the live demo: 18 companies barely filled one page
-- and never touched AAA or D, so the distribution chart never showed a full
-- spread. Adds 30 more across a wider range of sectors/countries/grades.
INSERT INTO company (id, name, ticker, sector, country, description) VALUES
    ('22222222-2222-2222-2222-222222222201', 'Nova Robotics Inc', 'NOVA', 'Technology', 'US', 'Industrial automation and robotics platforms.'),
    ('22222222-2222-2222-2222-222222222202', 'Meridian Pharma Group', 'MRDP', 'Health Care', 'GB', 'Specialty pharmaceutical manufacturer.'),
    ('22222222-2222-2222-2222-222222222203', 'Atlas Shipping Lines', 'ATLS', 'Industrials', 'GR', 'Dry bulk and tanker shipping fleet operator.'),
    ('22222222-2222-2222-2222-222222222204', 'Sundance Media Corp', 'SUND', 'Communication Services', 'US', 'Regional broadcast television group.'),
    ('22222222-2222-2222-2222-222222222205', 'Fairwind Renewables', 'FWND', 'Utilities', 'DE', 'Onshore wind generation operator.'),
    ('22222222-2222-2222-2222-222222222206', 'Cobalt Mining PLC', 'COBM', 'Materials', 'ZA', 'Battery-metals extraction and processing.'),
    ('22222222-2222-2222-2222-222222222207', 'Harbor Trust Bank', 'HRBR', 'Financials', 'US', 'Regional commercial and retail bank.'),
    ('22222222-2222-2222-2222-222222222208', 'Redwood Software Inc', 'RDWD', 'Technology', 'US', 'Enterprise workflow automation software.'),
    ('22222222-2222-2222-2222-222222222209', 'Silvercrest Hotels', 'SLVC', 'Consumer Discretionary', 'FR', 'Upscale hotel and resort chain.'),
    ('22222222-2222-2222-2222-222222222210', 'Green Valley Foods', 'GVF', 'Consumer Staples', 'NL', 'Packaged and frozen food producer.'),
    ('22222222-2222-2222-2222-222222222211', 'Zenith Robotics', 'ZROB', 'Technology', 'KR', 'Warehouse and logistics robotics manufacturer.'),
    ('22222222-2222-2222-2222-222222222212', 'Ashford Real Estate Trust', 'ASFD', 'Real Estate', 'US', 'Diversified commercial REIT.'),
    ('22222222-2222-2222-2222-222222222213', 'Blue Nile Logistics', 'BNIL', 'Industrials', 'EG', 'Regional freight and warehousing operator.'),
    ('22222222-2222-2222-2222-222222222214', 'Crestview Capital Partners', 'CVCP', 'Financials', 'CH', 'Private wealth and asset management group.'),
    ('22222222-2222-2222-2222-222222222215', 'Solaris Energy Corp', 'SLRS', 'Energy', 'ES', 'Utility-scale solar developer and operator.'),
    ('22222222-2222-2222-2222-222222222216', 'Northgate Biotech', 'NRTB', 'Health Care', 'US', 'Clinical-stage biotechnology company.'),
    ('22222222-2222-2222-2222-222222222217', 'Ironclad Defense Systems', 'IRCL', 'Industrials', 'US', 'Defense electronics and systems integrator.'),
    ('22222222-2222-2222-2222-222222222218', 'Pacific Rim Airlines', 'PRAL', 'Industrials', 'SG', 'Regional passenger and cargo carrier.'),
    ('22222222-2222-2222-2222-222222222219', 'Whitestone Insurance Group', 'WHST', 'Financials', 'US', 'Commercial property and casualty insurer.'),
    ('22222222-2222-2222-2222-222222222220', 'Everest Materials Ltd', 'EVMT', 'Materials', 'IN', 'Cement and construction materials producer.'),
    ('22222222-2222-2222-2222-222222222221', 'Lumina Semiconductor', 'LUMI', 'Technology', 'TW', 'Advanced-node foundry services.'),
    ('22222222-2222-2222-2222-222222222222', 'Coastal Utilities Corp', 'CSTU', 'Utilities', 'US', 'Regulated water and electric utility.'),
    ('22222222-2222-2222-2222-222222222223', 'Ridgeline Telecom', 'RDGT', 'Communication Services', 'CA', 'Rural broadband and wireless carrier.'),
    ('22222222-2222-2222-2222-222222222224', 'Vantage Retail Holdings', 'VNTR', 'Consumer Discretionary', 'US', 'Department store and e-commerce retailer.'),
    ('22222222-2222-2222-2222-222222222225', 'Sapphire Financial Group', 'SPFG', 'Financials', 'SG', 'Trade finance and merchant banking group.'),
    ('22222222-2222-2222-2222-222222222226', 'Terra Nova Agriculture', 'TNAG', 'Consumer Staples', 'BR', 'Soybean and grain export producer.'),
    ('22222222-2222-2222-2222-222222222227', 'Skyline Construction Co', 'SKYC', 'Industrials', 'US', 'Commercial general contractor.'),
    ('22222222-2222-2222-2222-222222222228', 'Nordic Wind Power', 'NRWP', 'Utilities', 'NO', 'Offshore wind generation developer.'),
    ('22222222-2222-2222-2222-222222222229', 'Quantum Data Systems', 'QNTM', 'Technology', 'US', 'Enterprise data infrastructure and storage.'),
    ('22222222-2222-2222-2222-222222222230', 'Meadowbrook Consumer Goods', 'MDBK', 'Consumer Staples', 'US', 'Household and personal care products.');

INSERT INTO rating (company_id, grade, outlook, rating_date, rationale) VALUES
    ('22222222-2222-2222-2222-222222222201', 'A', 'STABLE', '2022-11-08', 'Strong recurring revenue from installed base.'),
    ('22222222-2222-2222-2222-222222222201', 'AA', 'STABLE', '2024-05-14', 'Upgraded on expanding margins and order backlog.'),
    ('22222222-2222-2222-2222-222222222201', 'AAA', 'STABLE', '2026-01-09', 'Upgraded on sustained market leadership and cash generation.'),

    ('22222222-2222-2222-2222-222222222202', 'A', 'STABLE', '2023-02-20', 'Diversified product portfolio, moderate leverage.'),
    ('22222222-2222-2222-2222-222222222202', 'AA', 'POSITIVE', '2025-06-11', 'Upgraded on pipeline maturation and patent protection.'),

    ('22222222-2222-2222-2222-222222222203', 'BB', 'NEGATIVE', '2023-04-17', 'Elevated charter rate volatility.'),
    ('22222222-2222-2222-2222-222222222203', 'BBB', 'STABLE', '2025-02-03', 'Upgraded on fleet renewal and long-term charter contracts.'),

    ('22222222-2222-2222-2222-222222222204', 'CCC', 'NEGATIVE', '2023-07-29', 'Structural decline in linear viewership.'),
    ('22222222-2222-2222-2222-222222222204', 'CC', 'NEGATIVE', '2024-10-22', 'Downgraded on accelerating ad-revenue erosion.'),
    ('22222222-2222-2222-2222-222222222204', 'D', 'NEGATIVE', '2026-02-18', 'Downgraded following missed interest payment.'),

    ('22222222-2222-2222-2222-222222222205', 'BBB', 'POSITIVE', '2023-09-05', 'Stable feed-in-tariff-backed cash flows.'),
    ('22222222-2222-2222-2222-222222222205', 'A', 'STABLE', '2025-04-27', 'Upgraded on portfolio diversification and lower cost of capital.'),

    ('22222222-2222-2222-2222-222222222206', 'B', 'NEGATIVE', '2023-01-12', 'High leverage amid capex-intensive expansion.'),
    ('22222222-2222-2222-2222-222222222206', 'CCC', 'NEGATIVE', '2024-08-30', 'Downgraded on weak battery-metals pricing.'),

    ('22222222-2222-2222-2222-222222222207', 'AA', 'STABLE', '2022-12-02', 'Well-capitalized deposit franchise, conservative underwriting.'),
    ('22222222-2222-2222-2222-222222222207', 'AAA', 'STABLE', '2025-03-19', 'Upgraded on sector-leading capital ratios.'),

    ('22222222-2222-2222-2222-222222222208', 'A', 'POSITIVE', '2023-05-16', 'High-margin recurring subscription revenue.'),
    ('22222222-2222-2222-2222-222222222208', 'AA', 'STABLE', '2024-12-09', 'Upgraded on strong net revenue retention.'),

    ('22222222-2222-2222-2222-222222222209', 'BB', 'STABLE', '2023-03-24', 'Cyclical exposure to discretionary travel demand.'),
    ('22222222-2222-2222-2222-222222222209', 'B', 'NEGATIVE', '2025-09-14', 'Downgraded on softening European leisure travel.'),

    ('22222222-2222-2222-2222-222222222210', 'BBB', 'STABLE', '2023-06-08', 'Defensive demand profile, stable input costs.'),

    ('22222222-2222-2222-2222-222222222211', 'BBB', 'POSITIVE', '2023-10-19', 'Rapid order growth in e-commerce fulfillment automation.'),
    ('22222222-2222-2222-2222-222222222211', 'A', 'STABLE', '2025-05-30', 'Upgraded on expanding customer base and margins.'),

    ('22222222-2222-2222-2222-222222222212', 'BBB', 'STABLE', '2022-10-11', 'Diversified property portfolio, moderate occupancy risk.'),
    ('22222222-2222-2222-2222-222222222212', 'BBB', 'NEGATIVE', '2024-11-25', 'Outlook revised on rising office vacancy rates.'),

    ('22222222-2222-2222-2222-222222222213', 'B', 'NEGATIVE', '2023-08-14', 'Currency volatility and regional infrastructure constraints.'),
    ('22222222-2222-2222-2222-222222222213', 'BB', 'STABLE', '2025-07-02', 'Upgraded on new port-access agreements.'),

    ('22222222-2222-2222-2222-222222222214', 'A', 'STABLE', '2023-01-30', 'Strong fee-based revenue, low balance-sheet risk.'),
    ('22222222-2222-2222-2222-222222222214', 'AA', 'STABLE', '2024-09-17', 'Upgraded on assets-under-management growth.'),

    ('22222222-2222-2222-2222-222222222215', 'BB', 'POSITIVE', '2023-11-27', 'Growing project pipeline, contracted offtake agreements.'),
    ('22222222-2222-2222-2222-222222222215', 'BB', 'STABLE', '2025-08-06', 'Outlook stabilized as construction financing secured.'),

    ('22222222-2222-2222-2222-222222222216', 'CCC', 'NEGATIVE', '2023-04-03', 'Pre-revenue, dependent on trial outcomes and financing.'),
    ('22222222-2222-2222-2222-222222222216', 'CC', 'NEGATIVE', '2025-01-21', 'Downgraded following a failed Phase 3 trial readout.'),

    ('22222222-2222-2222-2222-222222222217', 'A', 'STABLE', '2022-09-22', 'Long-duration government contracts, high revenue visibility.'),
    ('22222222-2222-2222-2222-222222222217', 'A', 'POSITIVE', '2024-06-13', 'Outlook improved on expanded procurement pipeline.'),

    ('22222222-2222-2222-2222-222222222218', 'B', 'NEGATIVE', '2023-02-08', 'High fuel-cost sensitivity, thin liquidity buffer.'),
    ('22222222-2222-2222-2222-222222222218', 'CCC', 'NEGATIVE', '2024-07-19', 'Downgraded on route capacity cuts and weak load factors.'),

    ('22222222-2222-2222-2222-222222222219', 'BBB', 'STABLE', '2023-05-05', 'Adequate reserves, moderate catastrophe exposure.'),
    ('22222222-2222-2222-2222-222222222219', 'A', 'STABLE', '2025-10-01', 'Upgraded on improved underwriting discipline.'),

    ('22222222-2222-2222-2222-222222222220', 'BB', 'STABLE', '2023-07-16', 'Regional demand growth offset by input-cost pressure.'),

    ('22222222-2222-2222-2222-222222222221', 'AA', 'STABLE', '2023-03-11', 'Leading-edge process technology, diversified customer base.'),
    ('22222222-2222-2222-2222-222222222221', 'AAA', 'STABLE', '2025-11-20', 'Upgraded on record utilization and structural demand for advanced nodes.'),

    ('22222222-2222-2222-2222-222222222222', 'A', 'STABLE', '2022-08-25', 'Regulated returns, predictable rate-case outcomes.'),

    ('22222222-2222-2222-2222-222222222223', 'BB', 'POSITIVE', '2023-12-14', 'Government subsidy support for rural broadband buildout.'),
    ('22222222-2222-2222-2222-222222222223', 'BBB', 'STABLE', '2025-06-28', 'Upgraded on subscriber growth and completed network buildout.'),

    ('22222222-2222-2222-2222-222222222224', 'B', 'NEGATIVE', '2023-01-05', 'Continued store-traffic decline, high lease burden.'),
    ('22222222-2222-2222-2222-222222222224', 'CCC', 'NEGATIVE', '2024-04-22', 'Downgraded amid accelerating same-store sales decline.'),
    ('22222222-2222-2222-2222-222222222224', 'D', 'NEGATIVE', '2025-12-03', 'Downgraded following Chapter 11 filing.'),

    ('22222222-2222-2222-2222-222222222225', 'AA', 'STABLE', '2022-11-30', 'Diversified trade-finance book, strong capital position.'),
    ('22222222-2222-2222-2222-222222222225', 'AAA', 'STABLE', '2024-10-08', 'Upgraded on sustained low loss rates and capital strength.'),

    ('22222222-2222-2222-2222-222222222226', 'BBB', 'STABLE', '2023-06-19', 'Export demand steady, currency hedges in place.'),
    ('22222222-2222-2222-2222-222222222226', 'BB', 'NEGATIVE', '2025-03-27', 'Downgraded on drought-driven yield declines.'),

    ('22222222-2222-2222-2222-222222222227', 'BBB', 'STABLE', '2023-09-28', 'Healthy backlog, moderate exposure to input-cost inflation.'),

    ('22222222-2222-2222-2222-222222222228', 'BB', 'POSITIVE', '2024-01-16', 'Large offshore pipeline, government policy support.'),
    ('22222222-2222-2222-2222-222222222228', 'A', 'STABLE', '2025-09-09', 'Upgraded on commissioning of first offshore array.'),

    ('22222222-2222-2222-2222-222222222229', 'AA', 'STABLE', '2023-08-01', 'Mission-critical enterprise infrastructure, sticky contracts.'),
    ('22222222-2222-2222-2222-222222222229', 'AAA', 'STABLE', '2025-12-15', 'Upgraded on sustained data-growth-driven demand.'),

    ('22222222-2222-2222-2222-222222222230', 'A', 'STABLE', '2023-04-10', 'Stable staple-goods demand, strong brand portfolio.'),
    ('22222222-2222-2222-2222-222222222230', 'BBB', 'NEGATIVE', '2025-05-23', 'Downgraded on private-label competitive pressure.');
