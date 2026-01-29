# Philippine Locations Database

This folder contains a SQLite database of all Philippine locations (regions, provinces, cities, municipalities) with the proper relationships.

## Files

- `schema.sql` - Database schema definition
- `import-locations.js` - Script to import data from `latest-ph-address-thanks-to-anehan` npm package
- `add-coordinates.js` - Script to add latitude/longitude coordinates using a knowledge base
- `philippine-locations.db` - SQLite database (created after running import script)
- `AI_PROMPT.md` - Instructions for AI to add coordinates to the database

## Getting Started

### 1. Install Dependencies

```bash
cd locations
bun install
```

### 2. Import All Locations

```bash
bun run import
```

This will:
- Import 18 regions
- Import 82 provinces (plus NCR)
- Import ~1,642 cities and municipalities
- Create proper relationships (foreign keys)
- Flag all locations as needing coordinates (`needsCoords = 1`)

### 3. Add Coordinates

Give `AI_PROMPT.md` to an AI with instructions to add coordinates. The AI should:

1. Query the database for locations where `needsCoords = 1`
2. Use geocoding APIs or knowledge base to find lat/lng
3. Update the database with coordinates
4. Set `needsCoords = 0`

Or run the local script with the built-in knowledge base:

```bash
bun run coords
```

## Database Schema

### Regions (18 records)
```sql
psgc          TEXT PRIMARY KEY  -- 10-digit PSGC code (e.g., "1400000000" = CAR)
name           TEXT              -- Region name (e.g., "Cordillera Administrative Region (CAR)")
correspondenceCode TEXT              -- Correspondence code
geographicLevel TEXT NOT NULL     -- 'Reg'
```

### Provinces (82 + 1 NCR)
```sql
psgc          TEXT PRIMARY KEY  -- 10-digit PSGC code (e.g., "1401100000" = Abra)
regionPsgc    TEXT NOT NULL     -- FK to regions (10-digit PSGC code)
name           TEXT NOT NULL     -- Province name (e.g., "Abra")
geographicLevel TEXT NOT NULL     -- 'Prov'
FOREIGN KEY (regionPsgc) REFERENCES regions(psgc)
```

### Cities/Municipalities (~1,642 records)
```sql
psgc          TEXT PRIMARY KEY  -- 10-digit PSGC code (e.g., "1401100001" = Bangued)
provincePsgc   TEXT NOT NULL     -- FK to provinces (10-digit PSGC code)
regionPsgc    TEXT              -- FK to regions (10-digit PSGC code, for direct reference)
name           TEXT NOT NULL     -- City/Municipality name (e.g., "Bangued")
cityClass      TEXT              -- 'HUC' | 'CC' | 'ICC' | NULL (for municipalities)
geographicLevel TEXT NOT NULL     -- 'City' | 'Mun'
lat            REAL              -- Latitude (to be populated by AI)
lng            REAL              -- Longitude (to be populated by AI)
needsCoords    INTEGER DEFAULT 1   -- 1 = needs coordinates, 0 = has coordinates
FOREIGN KEY (provincePsgc) REFERENCES provinces(psgc)
FOREIGN KEY (regionPsgc) REFERENCES regions(psgc)
```

## Relationships

The database has proper foreign key relationships:
- `provinces.regionPsgc` → `regions.psgc`
- `cities.provincePsgc` → `provinces.psgc`
- `cities.regionPsgc` → `regions.psgc`

This allows you to:
- Query all cities in a region: `SELECT * FROM cities WHERE regionPsgc = '1400000000'`
- Query all cities in a province: `SELECT * FROM cities WHERE provincePsgc = '1401100000'`
- Get city with province info via JOIN

## Queries for AI

### Get locations needing coordinates (batch of 100)

```sql
SELECT psgc, name, provincePsgc, regionPsgc
FROM cities
WHERE needsCoords = 1
LIMIT 100;
```

### Update coordinates for a location

```sql
UPDATE cities
SET lat = 17.1389,
    lng = 121.6150,
    needsCoords = 0
WHERE psgc = '1301000001';
```

### Get all locations for a region

```sql
SELECT c.*, p.name as province, r.name as region
FROM cities c
LEFT JOIN provinces p ON c.provincePsgc = p.psgc
LEFT JOIN regions r ON c.regionPsgc = r.psgc
WHERE c.regionPsgc = '1400000000'
ORDER BY c.name;
```

## Coordinate Requirements

- **Latitude**: 4 to 22 degrees (Philippines range)
- **Longitude**: 116 to 127 degrees (Philippines range)
- **Precision**: 4-6 decimal places
- **Coordinate system**: WGS84 / EPSG:4326

## Priorities for Adding Coordinates

1. **HUCs (Highly Urbanized Cities)** - These are the most important (Manila, Cebu City, Davao City, etc.)
2. **CCs (Component Cities)** - Major cities (Baguio, Iloilo, etc.)
3. **ICC (Independent Component Cities)** - Independent cities (Santiago, etc.)
4. **Municipalities** - Smaller towns (lower priority)

## Usage in LBF App

Once the database has coordinates, you can:

1. **Export to JSON** for Convex migration:
   ```bash
   # Create Convex-compatible JSON export
   node export-for-convex.js
   ```

2. **Query for location dropdowns**:
   ```sql
   SELECT name FROM cities WHERE needsCoords = 0 ORDER BY name;
   ```

3. **Find nearby locations** (use Convex's Haversine function):
   ```sql
   SELECT * FROM cities WHERE needsCoords = 0
   AND lat BETWEEN ? - 2 AND ? + 2
   AND lng BETWEEN ? - 2 AND ? + 2;
   ```

## Next Steps

1. Install dependencies: `bun install`
2. Run import: `bun run import`
3. Provide `AI_PROMPT.md` to AI to add coordinates
4. Export to Convex-compatible format
5. Load into Convex via Convex CLI or API

## Credits

- Data source: [latest-ph-address-thanks-to-anehan](https://github.com/aldrinPA/latest-ph-address)
- Official PSGC data from Philippine Statistics Authority (3Q 2025)
- Schema design for proper relational structure
