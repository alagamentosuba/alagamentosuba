const axios = require('axios');
const db = require('./db');

async function seedDatabase() {
    console.log("Iniciando varredura oficial de todas as ruas de Ubá-MG utilizando a Overpass API...");

    try {
        const query = `
            [out:json];
            area[name="Ubá"][admin_level=8]->.searchArea;
            way["highway"]["name"](area.searchArea);
            out center;
        `;

        const res = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const streets = new Map();
        res.data.elements.forEach(el => {
            if (el.tags && el.tags.name) {
                if (!streets.has(el.tags.name)) {
                    streets.set(el.tags.name, { lat: el.center.lat, lon: el.center.lon });
                }
            }
        });

        console.log(`Encontradas ${streets.size} vias únicas em Ubá. Gravando no Banco de Dados...`);

        db.serialize(() => {
            // Clear previous placeholder/randomized data
            db.run('DELETE FROM Flags');
            db.run('DELETE FROM Reports');
            db.run('DELETE FROM Streets');
            db.run('DELETE FROM sqlite_sequence WHERE name IN ("Streets", "Reports", "Flags")');

            const insertStmt = db.prepare('INSERT INTO Streets (name, lat, lng) VALUES (?, ?, ?)');

            let count = 0;
            for (const [name, coords] of streets.entries()) {
                insertStmt.run(name, coords.lat, coords.lon);
                count++;
            }
            insertStmt.finalize();
            console.log(`Sucesso absoluto: ${count} ruas reais e coordenadas centrais inseridas!`);
        });

    } catch (e) {
        console.error("Erro fatal ao requisitar OSM Overpass API:", e.message);
    }
}

// Give DB time to init
setTimeout(seedDatabase, 500);
