const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'philippine-locations.db'));

// Query to join all tables and get complete location data
const query = `
  SELECT 
    c.name as name,
    p.name as province,
    r.name as region,
    c.lat as lat,
    c.lng as lng
  FROM cities c
  JOIN provinces p ON c.provincePsgc = p.psgc
  JOIN regions r ON c.regionPsgc = r.psgc
  WHERE c.lat IS NOT NULL AND c.lng IS NOT NULL
  ORDER BY r.name, p.name, c.name
`;

const locations = db.prepare(query).all();

console.log(`Found ${locations.length} locations with coordinates`);

// Generate Convex-compatible JSON
const convexData = locations.map(loc => ({
  name: loc.name,
  province: loc.province,
  region: loc.region,
  lat: loc.lat,
  lng: loc.lng,
}));

// Write to JSON file
const outputPath = path.join(__dirname, 'locations-for-convex.json');
fs.writeFileSync(outputPath, JSON.stringify(convexData, null, 2), 'utf-8');

console.log(`✅ Exported ${convexData.length} locations to ${outputPath}`);

// Sample first 5 entries
console.log('\nSample entries:');
console.log(JSON.stringify(convexData.slice(0, 5), null, 2));

db.close();
