-- Philippine Locations Database
-- Schema for storing all Philippine locations with coordinates

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  psgc TEXT PRIMARY KEY,  -- 10-digit PSGC code (e.g., "1400000000" = CAR)
  name TEXT NOT NULL,  -- Region name (e.g., "Cordillera Administrative Region (CAR)")
  correspondenceCode TEXT,  -- Correspondence code
  geographicLevel TEXT NOT NULL  -- 'Reg'
);

-- Provinces table
CREATE TABLE IF NOT EXISTS provinces (
  psgc TEXT PRIMARY KEY,  -- 10-digit PSGC code (e.g., "1401100000" = Abra)
  regionPsgc TEXT NOT NULL,  -- FK to regions
  name TEXT NOT NULL,  -- Province name (e.g., "Abra")
  geographicLevel TEXT NOT NULL,  -- 'Prov'
  FOREIGN KEY (regionPsgc) REFERENCES regions(psgc)
);

-- Cities and Municipalities table
CREATE TABLE IF NOT EXISTS cities (
  psgc TEXT PRIMARY KEY,  -- 10-digit PSGC code (e.g., "1401100001" = Bangued)
  provincePsgc TEXT NOT NULL,  -- FK to provinces
  regionPsgc TEXT,  -- FK to regions (for direct reference)
  name TEXT NOT NULL,  -- City/Municipality name (e.g., "Bangued")
  cityClass TEXT,  -- 'HUC' | 'CC' | 'ICC' | NULL (for municipalities)
  geographicLevel TEXT NOT NULL,  -- 'City' | 'Mun'
  lat REAL,  -- Latitude (to be populated by AI)
  lng REAL,  -- Longitude (to be populated by AI)
  needsCoords INTEGER DEFAULT 1,  -- Flag: 1 = needs coordinates, 0 = has coordinates
  FOREIGN KEY (provincePsgc) REFERENCES provinces(psgc),
  FOREIGN KEY (regionPsgc) REFERENCES regions(psgc)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(provincePsgc);
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(regionPsgc);
CREATE INDEX IF NOT EXISTS idx_cities_needs_coords ON cities(needsCoords);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Sample data structure
-- Regions: 18
-- Provinces: 82 + NCR
-- Cities/Municipalities: ~1,642
