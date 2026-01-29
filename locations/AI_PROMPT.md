# AI Task: Add Coordinates to Philippine Locations

## Database Overview

You have access to a SQLite database at `locations/philippine-locations.db` with the following schema:

### Schema Structure

#### regions (18 records)
- `psgc` TEXT PRIMARY KEY (10-digit PSGC code, e.g., "1400000000" for CAR)
- `name` TEXT (Region name, e.g., "Cordillera Administrative Region (CAR)")
- `correspondenceCode` TEXT (Correspondence code)
- `geographicLevel` TEXT (always "Reg")

#### provinces (82 + 1 NCR)
- `psgc` TEXT PRIMARY KEY (10-digit PSGC code, e.g., "1401100000" for Abra)
- `regionPsgc` TEXT (FK to regions, 10-digit PSGC code)
- `name` TEXT (Province name, e.g., "Abra")
- `geographicLevel` TEXT (always "Prov")
- **FOREIGN KEY** references `regions(psgc)`

#### cities (~1,642 records)
- `psgc` TEXT PRIMARY KEY (10-digit PSGC code, e.g., "1401100001" for Bangued)
- `provincePsgc` TEXT (FK to provinces, 10-digit PSGC code)
- `regionPsgc` TEXT (FK to regions, 10-digit PSGC code)
- `name` TEXT (City/Municipality name, e.g., "Bangued")
- `cityClass` TEXT ('HUC' | 'CC' | 'ICC' | NULL for municipalities)
- `geographicLevel` TEXT ('City' for cities/HUC/CC/ICC, 'Mun' for municipalities)
- `lat` REAL (Latitude - NULL initially, to be populated by YOU)
- `lng` REAL (Longitude - NULL initially, to be populated by YOU)
- `needsCoords` INTEGER (1 = needs coordinates, 0 = has coordinates)
- **FOREIGN KEY** references `provinces(psgc)` and `regions(psgc)`

## Your Task

For each city/municipality where `needsCoords = 1`, you need to:

### 1. Query the Database

Run these SQLite queries to get locations that need coordinates:

```sql
-- Get first 100 locations that need coordinates
SELECT psgc, name, provincePsgc, regionPsgc
FROM cities
WHERE needsCoords = 1
LIMIT 100;
```

### 2. Look Up Coordinates

Use your internal knowledge base or external geocoding APIs to find the latitude and longitude for each location.

**Available geocoding options:**
- OpenStreetMap Nominatim API (free, rate-limited): `https://nominatim.openstreetmap.org/search?city={name}&country=PH&format=json`
- Google Maps Geocoding API (paid, more accurate)
- Mapbox Geocoding API (free tier, accurate)

**Important:**
- Use coordinates for the **city center**, not a random point within the city
- Precision should be to 4-6 decimal places
- Use WGS84/EPSG:4326 coordinate system

### 3. Update the Database

For each location you process, run:

```sql
UPDATE cities
SET lat = @lat,
    lng = @lng,
    needsCoords = 0
WHERE psgc = @psgc;
```

Example:
```sql
UPDATE cities
SET lat = 17.1389,
    lng = 121.6150,
    needsCoords = 0
WHERE psgc = '1401100001';
```

## Example Workflow

Here's a complete example of processing 10 locations:

```typescript
const Database = require('better-sqlite3');
const db = new Database('locations/philippine-locations.db');

// 1. Get locations needing coordinates
const locations = db.prepare(`
  SELECT psgc, name, provincePsgc, regionPsgc
  FROM cities
  WHERE needsCoords = 1
  LIMIT 10
`).all();

// 2. For each location, find coordinates using knowledge base
const updates = db.prepare(`
  UPDATE cities
  SET lat = @lat,
      lng = @lng,
      needsCoords = 0
  WHERE psgc = @psgc
`);

for (const location of locations) {
  // Look up coordinates (you do this!)
  const coords = getCoordinates(location.name, location.province);

  if (coords) {
    updates.run({
      psgc: location.psgc,
      lat: coords.lat,
      lng: coords.lng
    });
  }
}

function getCoordinates(cityName, provinceName) {
  // Your AI knowledge base here
  const coordsDB = {
    'Manila': { lat: 14.5995, lng: 120.9842 },
    'Cebu City': { lat: 10.3157, lng: 123.8854 },
    // ... add more from your knowledge
  };

  return coordsDB[cityName] || null;
}
```

## Performance Guidelines

1. **Batch processing**: Process 50-100 locations at a time to avoid timeouts
2. **Use transactions**: Wrap updates in a transaction for atomicity
3. **Verify accuracy**: Double-check coordinates are in the Philippines (lat: 4-22, lng: 116-127)
4. **Handle duplicates**: Some cities may have the same name in different provinces - use province to disambiguate
5. **Prioritize major cities**: Start with HUCs (Highly Urbanized Cities) as they're most important for the app

## Coordinates Validation

Before updating, validate that:
- Latitude is between 4 and 22 degrees
- Longitude is between 116 and 127 degrees
- Coordinates are within Philippine territory
- Precision is at least 4 decimal places

## Output Format

After processing, provide a summary:
```
Processed: X locations
Added coordinates to: X locations
Skipped: X locations (not found)
Errors: X locations
Remaining locations needing coordinates: X
```

## Priority Order

Process locations in this order:
1. **High Priority**: HUCs (Highly Urbanized Cities) - major cities like Manila, Cebu City, Davao City
2. **Medium Priority**: CCs (Component Cities)
3. **Low Priority**: ICCs (Independent Component Cities)
4. **Bulk**: Municipalities (start with those in Metro Manila, Cebu, Davao regions)

## Getting Started

1. Install dependencies: `bun install`
2. Run import script: `node import-locations.js`
3. Start processing: Provide your AI response to add coordinates

Good luck! 🇵🇭
