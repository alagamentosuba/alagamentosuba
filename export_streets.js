const db = require('./db');
const fs = require('fs');

setTimeout(() => {
    db.all('SELECT name, lat, lng FROM Streets', [], (err, rows) => {
        if (err) throw err;
        fs.writeFileSync('streets.json', JSON.stringify(rows, null, 2));
        console.log(`Exported ${rows.length} streets to streets.json`);
        process.exit(0);
    });
}, 1000);
