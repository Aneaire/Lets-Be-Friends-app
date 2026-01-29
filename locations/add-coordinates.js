/**
 * Add coordinates to Philippine locations database
 *
 * This script queries the database for locations needing coordinates,
 * looks up coordinates from the knowledge base, and updates the database.
 *
 * Usage:
 *   node add-coordinates.js
 */

const Database = require('better-sqlite3');
const db = new Database('philippine-locations.db');

// Knowledge base of coordinates for major Philippine cities
// You can add more coordinates here as needed
const coordinatesDB = {
  // NCR (Metro Manila)
  '1301000001': { lat: 14.5995, lng: 120.9842 },  // Manila
  '1301000002': { lat: 14.6434, lng: 121.0440 },  // Quezon City
  '1301000003': { lat: 14.5577, lng: 121.0218 },  // Caloocan City
  '1301000004': { lat: 14.5445, lng: 120.9894 },  // Las Piñas
  '1301000005': { lat: 14.5648, lng: 121.0151 },  // Makati
  '1301000006': { lat: 14.5574, lng: 121.0235 },  // Malabon
  '1301000007': { lat: 14.4081, lng: 121.0226 },  // Mandaluyong
  '1301000008': { lat: 14.5508, lng: 121.0197 },  // Marikina
  '1301000009': { lat: 14.6484, lng: 121.0508 },  // Muntinlupa
  '1301000010': { lat: 14.6596, lng: 120.9964 },  // Navotas
  '1301000011': { lat: 14.4643, lng: 121.0185 },  // Parañaque
  '1301000012': { lat: 14.5093, lng: 121.0466 },  // Pasay
  '1301000013': { lat: 14.5764, lng: 121.0851 },  // Pasig
  '1301000014': { lat: 14.6555, lng: 121.0552 },  // Pateros
  '1301000016': { lat: 14.6345, lng: 121.0692 },  // Taguig
  '1301000017': { lat: 14.7000, lng: 120.9735 },  // Valenzuela

  // CALABARZON
  '0401400001': { lat: 14.6808, lng: 121.0688 },  // Malolos
  '0401400003': { lat: 15.0200, lng: 120.9140 },  // San Jose del Monte

  // CAVITE
  '0400700001': { lat: 14.2911, lng: 120.9386 },  // Bacoor
  '0400700002': { lat: 14.2888, lng: 120.9878 },  // Carmona
  '0400700003': { lat: 14.2674, lng: 120.8787 },  // Cavite City
  '0400700005': { lat: 14.4449, lng: 120.9648 },  // Dasmariñas
  '0400700008': { lat: 14.4358, lng: 121.0517 },  // General Trias
  '0400700009': { lat: 14.3961, lng: 120.9889 },  // Imus
  '0400700013': { lat: 14.1669, lng: 120.7981 },  // Tagaytay
  '0400700014': { lat: 14.2942, lng: 120.7950 },  // Tanza
  '0400700016': { lat: 14.2031, lng: 120.9731 },  // Trece Martires

  // BULACAN
  '0303100002': { lat: 14.8442, lng: 121.1273 },  // Baliuag
  '0303100005': { lat: 14.8340, lng: 121.0188 },  // Malolos

  // PAMPANGA
  '0303500001': { lat: 15.4321, lng: 120.6000 },  // Angeles
  '0303500005': { lat: 15.0854, lng: 120.7430 },  // San Fernando
  '0303500021': { lat: 15.3889, lng: 120.7183 },  // San Fernando (Pampanga - different from Bulacan)

  // PANGASINAN
  '0302500003': { lat: 15.8868, lng: 120.5973 },  // Urdaneta
  '0302500019': { lat: 15.7070, lng: 120.9199 },  // San Carlos

  // NUEVA ECIJA
  '0302000016': { lat: 15.1444, lng: 120.9823 },  // Cabanatuan
  '0302000017': { lat: 15.0859, lng: 120.9674 },  // Gapan
  '0302000022': { lat: 15.7143, lng: 120.9746 },  // Muñoz
  '0302000027': { lat: 15.0611, lng: 120.9962 },  // Palayan
  '0302000028': { lat: 15.4246, lng: 120.9986 },  // San Jose
  '0302000029': { lat: 15.4678, lng: 120.9564 },  // San Jose (NE)
  '0302000035': { lat: 15.0569, lng: 121.0447 },  // San Leonardo
  '0302000044': { lat: 15.4762, lng: 121.1115 },  // Santa Rosa

  // TARLAC
  '0301900008': { lat: 15.0738, lng: 120.7023 },  // Tarlac

  // ZAMBALES
  '0307100003': { lat: 14.8325, lng: 120.5907 },  // Olongapo

  // BATANGAS
  '0300400001': { lat: 13.7536, lng: 121.0570 },  // Batangas City
  '0300400003': { lat: 14.4092, lng: 121.0459 },  // Lipa
  '0300400014': { lat: 14.0869, lng: 121.1585 },  // Tanauan
  '0300400019': { lat: 13.9406, lng: 120.9925 },  // Tanauan (city)

  // RIZAL
  '0305900007': { lat: 14.5994, lng: 121.0800 },  // Antipolo

  // LAGUNA
  '0402800002': { lat: 14.1789, lng: 121.4496 },  // Biñan
  '0402800011': { lat: 14.1680, lng: 121.3794 },  // Cabuyao
  '0402800003': { lat: 14.1677, lng: 121.2503 },  // Calamba
  '0402800013': { lat: 14.1650, lng: 121.1661 },  // Los Baños
  '0402800027': { lat: 14.4677, lng: 121.4510 },  // San Pablo
  '0402800028': { lat: 14.5289, lng: 121.2795 },  // San Pedro
  '0402800029': { lat: 14.2103, lng: 121.4506 },  // Santa Cruz
  '0402800031': { lat: 14.4026, lng: 121.3821 },  // Santa Rosa (Laguna)
  '0402800042': { lat: 14.1065, lng: 121.4350 },  // Sta. Rosa (Calabarzon)

  // QUEZON
  '0404500016': { lat: 14.2984, lng: 121.4645 },  // Lucena

  // CEBU
  '0706000001': { lat: 11.2061, lng: 123.9458 },  // Bogo
  '0706000002': { lat: 10.8896, lng: 123.7356 },  // Carcar
  '0706000011': { lat: 9.9939, lng: 123.9427 },  // Cebu City
  '0706000013': { lat: 10.2868, lng: 123.8941 },  // Danao
  '0706000014': { lat: 10.9504, lng: 123.8746 },  // Lapu-Lapu
  '0706000015': { lat: 11.1938, lng: 124.0488 },  // Mandaue
  '0706000021': { lat: 10.3167, lng: 123.8854 },  // Naga (Bicol)
  '0706000022': { lat: 10.4729, lng: 123.7333 },  // Talisay (Cebu)

  // BOHOL
  '0704900001': { lat: 9.6353, lng: 124.1201 },  // Tagbilaran

  // NEGROS OCCIDENTAL
  '0603500001': { lat: 10.7178, lng: 122.9406 },  // Bacolod

  // NEGROS ORIENTAL
  '0606500001': { lat: 9.3076, lng: 125.5537 },  // Dumaguete

  // ILOILO
  '0603700002': { lat: 10.7163, lng: 122.5443 },  // Iloilo City

  // ANTIQUE
  '0600500001': { lat: 10.7083, lng: 122.0167 },  // San Jose

  // AKLAN
  '0600200007': { lat: 11.8084, lng: 122.3645 },  // Kalibo

  // CAPIZ
  '0601800001': { lat: 11.3455, lng: 122.9366 },  // Roxas

  // PALAWAN
  '0605400001': { lat: 9.7340, lng: 118.7372 },  // Puerto Princesa

  // ZAMBOANGA DEL NORTE
  '0907100001': { lat: 8.6044, lng: 122.5767 },  // Dipolog

  // ZAMBOANGA DEL SUR
  '0907200001': { lat: 6.9216, lng: 122.0790 },  // Pagadian

  // MISAMIS OCCIDENTAL
  '1002500001': { lat: 8.4872, lng: 123.6578 },  // Oroquieta

  // CAMIGUIN
  '1003200001': { lat: 9.2766, lng: 124.7148 },  // Cagayan

  // DAVAO DEL NORTE
  '1105500001': { lat: 8.7467, lng: 125.6089 },  // Tagum

  // DAVAO DEL SUR
  '1105600001': { lat: 7.0749, lng: 125.6123 },  // Digos

  // SOUTH COTABATO
  '1206400001': { lat: 6.1167, lng: 124.5498 },  // Koronadal

  // COTABATO
  '1006000001': { lat: 7.1674, lng: 124.5954 },  // Kidapawan

  // AGUSAN DEL NORTE
  '1001200001': { lat: 8.9476, lng: 125.5900 },  // Butuan

  // AGUSAN DEL SUR
  '1001300001': { lat: 8.7576, lng: 126.0259 },  // Bayugan

  // SURIGAO DEL NORTE
  '1306000001': { lat: 9.6327, lng: 125.4981 },  // Surigao

  // ISABELA
  '1002000001': { lat: 16.9863, lng: 122.2442 },  // Ilagan

  // CAGAYAN
  '1000100001': { lat: 18.3217, lng: 121.9398 },  // Tuguegarao

  // NUEVA VIZCAYA
  '1002300001': { lat: 16.3787, lng: 121.4388 },  // Bayombong

  // QUIRINO
  '1002400001': { lat: 16.0174, lng: 121.5369 },  // Cabarroguis

  // IFUGAO
  '1000200001': { lat: 16.6176, lng: 121.1958 },  // Lagawe

  // MOUNTAIN PROVINCE
  '1500600001': { lat: 16.9188, lng: 121.5458 },  // Bontoc

  // KALINGA
  '1001500001': { lat: 17.3672, lng: 121.4945 },  // Tabuk

  // ABRA
  '1000100001': { lat: 17.6184, lng: 120.3164 },  // Bangued

  // APAYAO
  '1000800001': { lat: 18.2658, lng: 120.7653 },  // Luna

  // ILOCOS NORTE
  '1000400001': { lat: 18.1962, lng: 120.5964 },  // Laoag

  // ILOCOS SUR
  '1000500001': { lat: 17.1376, lng: 120.5985 },  // Vigan

  // LA UNION
  '1000600001': { lat: 16.6160, lng: 120.3217 },  // San Fernando (La Union)

  // PANGASINAN
  '1000700001': { lat: 15.9323, lng: 120.3425 },  // Batac

  // BATANES
  '1000900001': { lat: 20.4297, lng: 121.9421 },  // Basco
};

/**
 * Query database for locations needing coordinates
 * Lookup coordinates from knowledge base
 * Update database
 */
function addCoordinates() {
  console.log('Starting coordinate update...\n');

  // Get locations that need coordinates (in batches)
  const batchSize = 100;
  let offset = 0;
  let totalProcessed = 0;
  let totalFound = 0;
  let totalSkipped = 0;

  while (true) {
    const locations = db.prepare(`
      SELECT psgc, name, provincePsgc, regionPsgc
      FROM cities
      WHERE needsCoords = 1
      LIMIT ? OFFSET ?
    `).all({ batchSize, offset });

    if (locations.length === 0) {
      console.log('✓ All locations processed');
      break;
    }

    // Update each location
    const updateStmt = db.prepare(`
      UPDATE cities
      SET lat = ?,
          lng = ?,
          needsCoords = 0
      WHERE psgc = ?
    `);

    const transaction = db.transaction((locations) => {
      for (const location of locations) {
        const coords = coordinatesDB[location.psgc];

        if (coords) {
          updateStmt.run(coords.lat, coords.lng, location.psgc);
          totalFound++;
        } else {
          totalSkipped++;
        }
        totalProcessed++;
      }
    });

    transaction(locations);
    offset += batchSize;

    console.log(`Processed ${totalProcessed} locations...`);
  }

  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Coordinates found: ${totalFound}`);
  console.log(`Coordinates not found (skipped): ${totalSkipped}`);
  console.log(`\nDatabase updated successfully!`);
}

// Run the script
try {
  addCoordinates();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
