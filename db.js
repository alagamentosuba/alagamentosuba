const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open the SQLite database
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            googleId TEXT UNIQUE,
            name TEXT,
            email TEXT UNIQUE,
            photoUrl TEXT,
            isBanned INTEGER DEFAULT 0,
            role TEXT DEFAULT 'feed_user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Alter table to add role if it was created previously (SQLite ignore error if exists)
            db.run("ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'feed_user'", (err) => {
                // Promote Lucas and Local Test to Big-Boss automatically
                db.run(`UPDATE Users SET role = 'big_boss' WHERE email = 'lucasmorforio@gmail.com' OR googleId = '123456789_LOCAL_TEST'`);
            });
        });

        // Streets table (Pre-populated names/coords of Uba)
        db.run(`CREATE TABLE IF NOT EXISTS Streets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            lat REAL,
            lng REAL
        )`, (err) => {
            if (!err) {
                db.get('SELECT COUNT(*) as count FROM Streets', [], (cerr, row) => {
                    if (!cerr && row.count === 0) {
                        try {
                            const fs = require('fs');
                            const path = require('path');
                            const streetsFile = path.join(__dirname, 'streets.json');
                            if (fs.existsSync(streetsFile)) {
                                const streetsData = JSON.parse(fs.readFileSync(streetsFile, 'utf8'));
                                const insertStmt = db.prepare('INSERT INTO Streets (name, lat, lng) VALUES (?, ?, ?)');
                                streetsData.forEach(s => insertStmt.run(s.name, s.lat, s.lng));
                                insertStmt.finalize();
                                console.log(`Auto-seeded ${streetsData.length} streets from JSON payload!`);
                            }
                        } catch (e) {
                            console.error('Failed to auto-seed streets:', e.message);
                        }
                    }
                });
            }
        });

        // Reports table (Community or Official alerts)
        db.run(`CREATE TABLE IF NOT EXISTS Reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            streetId INTEGER,
            userId INTEGER,
            status TEXT,
            description TEXT,
            isOfficial INTEGER DEFAULT 0,
            reportCount INTEGER DEFAULT 0,
            lat REAL,
            lng REAL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(streetId) REFERENCES Streets(id),
            FOREIGN KEY(userId) REFERENCES Users(id)
        )`, () => {
            db.run("ALTER TABLE Reports ADD COLUMN lat REAL", (err) => { });
            db.run("ALTER TABLE Reports ADD COLUMN lng REAL", (err) => { });
        });

        // Flags/Denúncias Table (For moderating reports)
        db.run(`CREATE TABLE IF NOT EXISTS Flags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reportId INTEGER,
            userId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(reportId) REFERENCES Reports(id),
            FOREIGN KEY(userId) REFERENCES Users(id)
        )`);

        console.log('Database tables verified.');
    });
}

module.exports = db;
