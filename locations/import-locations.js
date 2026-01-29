/**
 * Import Philippine locations from latest-ph-address package to SQLite database
 *
 * Usage:
 *   node import-locations.js
 */

const Database = require('better-sqlite3');
const phAddress = require('latest-ph-address-thanks-to-anehan');
const fs = require('fs');
const path = require('path');

// Initialize SQLite database
const dbPath = path.join(__dirname, 'philippine-locations.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Import data from latest-ph-address
function importLocations() {
  console.log('Starting location import...');

  // 1. Import Regions
  console.log('Importing regions...');
  const regions = phAddress.getRegions();
  const regionStmt = db.prepare(`
    INSERT OR REPLACE INTO regions (psgc, name, correspondenceCode, geographicLevel)
    VALUES (@psgc, @name, @correspondenceCode, @geographicLevel)
  `);

  db.transaction((regions) => {
    for (const region of regions) {
      regionStmt.run({
        psgc: region.psgc,
        name: region.name,
        correspondenceCode: region.correspondenceCode || null,
        geographicLevel: 'Reg'
      });
    }
  })(regions);

  console.log(`  ✓ Imported ${regions.length} regions`);

  // 2. Import Provinces
  console.log('Importing provinces...');
  const allProvinces = phAddress.getProvincesByRegion();

  const provinceStmt = db.prepare(`
    INSERT OR REPLACE INTO provinces (psgc, regionPsgc, name, geographicLevel)
    VALUES (@psgc, @regionPsgc, @name, @geographicLevel)
  `);

  db.transaction((provinces) => {
    for (const province of provinces) {
      let regionPsgc = province.psgc?.substring(0, 2) + '00000000'; // Extract region from province PSGC

      // Handle NCR special case
      if (province.psgc === '-NO PROVINCE-') {
        regionPsgc = '1300000000'; // NCR
      }

      provinceStmt.run({
        psgc: province.psgc === '-NO PROVINCE-' ? null : province.psgc,
        regionPsgc,
        name: province.name,
        geographicLevel: 'Prov'
      });
    }
  })(allProvinces);

  console.log(`  ✓ Imported ${allProvinces.length} provinces`);

  // 3. Import Cities and Municipalities
  console.log('Importing cities and municipalities...');
  const cityStmt = db.prepare(`
    INSERT OR REPLACE INTO cities (psgc, provincePsgc, regionPsgc, name, cityClass, geographicLevel, lat, lng, needsCoords)
    VALUES (@psgc, @provincePsgc, @regionPsgc, @name, @cityClass, @geographicLevel, @lat, @lng, @needsCoords)
  `);

  // Get all cities and municipalities by iterating through provinces
  let totalCitiesCount = 0;
  const validProvinces = allProvinces.filter(p => p.psgc !== '-NO PROVINCE-');

  for (const province of validProvinces) {
    const cities = phAddress.getCitiesAndMunsByProvince(province.psgc);
    
    for (const city of cities) {
      const regionPsgc = city.psgc?.substring(0, 2) + '00000000';

      cityStmt.run({
        psgc: city.psgc,
        provincePsgc: province.psgc,
        regionPsgc,
        name: city.name,
        cityClass: city.cityClass || null,
        geographicLevel: city.cityClass ? 'City' : 'Mun',
        lat: null,
        lng: null,
        needsCoords: 1
      });
      totalCitiesCount++;
    }
  }

  console.log(`  ✓ Imported ${totalCitiesCount} cities and municipalities`);

  // Create indexes
  console.log('Creating indexes...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(provincePsgc);
    CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(regionPsgc);
    CREATE INDEX IF NOT EXISTS idx_cities_needs_coords ON cities(needsCoords);
  `);

  console.log('  ✓ Indexes created');

  // Print summary
  console.log('\n=== Import Summary ===');
  console.log(`Total locations in database:`);
  console.log(`  Regions: ${regions.length}`);
  console.log(`  Provinces: ${allProvinces.length}`);
  console.log(`  Cities/Municipalities: ${totalCitiesCount}`);
  console.log('\n✓ Import completed successfully!');
  console.log(`\nDatabase location: ${dbPath}`);
}

// Run the import
try {
  // Create tables first
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  // Import data
  importLocations();

} catch (error) {
  console.error('❌ Error during import:', error.message);
  process.exit(1);
} finally {
  db.close();
}
