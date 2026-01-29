const Database = require('better-sqlite3');
const db = new Database('locations/philippine-locations.db');

const count = db.prepare('SELECT COUNT(*) as count FROM cities').get();
console.log('Total cities:', count.count);

const needCoords = db.prepare('SELECT COUNT(*) as count FROM cities WHERE needsCoords = 1').get();
console.log('Cities needing coordinates:', needCoords.count);

const haveCoords = db.prepare('SELECT COUNT(*) as count FROM cities WHERE needsCoords = 0').get();
console.log('Cities with coordinates:', haveCoords.count);

db.close();
