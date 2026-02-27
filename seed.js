const db = require('./db');

setTimeout(() => {
    db.serialize(() => {
        const insertStreet = db.prepare('INSERT OR IGNORE INTO Streets (name, lat, lng) VALUES (?, ?, ?)');
        const streets = [
            { name: "MGC-120 - Km 706", lat: -21.1215, lng: -42.9427 },
            { name: "Ponte Major Siqueira", lat: -21.12356, lng: -42.94520 },
            { name: "MG-447 - Km 1", lat: -21.1350, lng: -42.9215 },
            { name: "MG-447 - Km 8", lat: -21.0850, lng: -42.8950 },
            { name: "Avenida Beira-Rio", lat: -21.1200, lng: -42.9400 },
            { name: "Ponte Major Fusaro", lat: -21.1150, lng: -42.9500 },
            { name: "Avenida Comendador Jacinto Soares de Souza Lima", lat: -21.1221, lng: -42.9410 },
            { name: "Rua Treze de Maio", lat: -21.1245, lng: -42.9433 }
        ];

        streets.forEach(s => insertStreet.run(s.name, s.lat, s.lng));
        insertStreet.finalize();
        console.log("Database seeded successfully with street names.");
    });
}, 1000);
