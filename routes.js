const express = require('express');
const passport = require('passport');
const axios = require('axios');
const db = require('./db');

const router = express.Router();

// --- Auth Routes ---
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=login_failed' }),
    (req, res) => {
        // Successful authentication
        res.redirect('/');
    }
);

// --- BYPASS LOGIN PARA TESTES LOCAIS ---
router.get('/auth/bypass', (req, res) => {
    const dummyProfile = {
        id: '123456789_LOCAL_TEST',
        displayName: 'Lucas (Local Dev)',
        emails: [{ value: 'lucas.teste@local.ambiente' }],
        photos: [{ value: 'https://ui-avatars.com/api/?name=Lucas+Local&background=0D8ABC&color=fff' }]
    };

    db.get('SELECT * FROM Users WHERE googleId = ?', [dummyProfile.id], (err, user) => {
        if (err) return res.redirect('/?error=db_error');

        if (user) {
            req.login(user, (err) => { if (err) return; res.redirect('/'); });
        } else {
            db.run(
                'INSERT INTO Users (googleId, name, email, photoUrl) VALUES (?, ?, ?, ?)',
                [dummyProfile.id, dummyProfile.displayName, dummyProfile.emails[0].value, dummyProfile.photos[0].value],
                function (err) {
                    if (err) return;
                    req.login({ id: this.lastID, googleId: dummyProfile.id, name: dummyProfile.displayName }, (err) => {
                        res.redirect('/');
                    });
                }
            );
        }
    });
});

router.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

router.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Não autenticado' });
    }
});

// --- API Routes ---

// Get all blocks (Streets & Reports joined for the map)
router.get('/api/map-data', (req, res) => {
    const query = `
        SELECT r.id as reportId, s.id as streetId, s.name as title, 
               COALESCE(r.lat, s.lat) as lat, 
               COALESCE(r.lng, s.lng) as lng, 
               r.status, r.description, r.isOfficial, u.name as source, u.role as authorRole
        FROM Reports r
        JOIN Streets s ON r.streetId = s.id
        LEFT JOIN Users u ON r.userId = u.id
        WHERE r.reportCount < 10
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Lookup streets for dropdown handling both accented (raw) and non-accented (q) inputs
router.get('/api/streets/search', (req, res) => {
    let q = req.query.q || '';
    let raw = req.query.raw || q; // fallback

    if (typeof q !== 'string') q = q.toString();
    if (typeof raw !== 'string') raw = raw.toString();

    const wordsQ = q.trim().split(/\s+/).filter(w => w.length > 0);
    const wordsRaw = raw.trim().split(/\s+/).filter(w => w.length > 0);

    if (wordsQ.length === 0) {
        return res.json([]);
    }

    // Build conditions checking both the raw word AND the normalized word (SQLite doesn't natively do accent-blind searches well)
    const conditions = [];
    const params = [];

    for (let i = 0; i < wordsQ.length; i++) {
        conditions.push(`(name LIKE ? OR name LIKE ?)`);
        params.push(`%${wordsQ[i]}%`, `%${wordsRaw[i] || wordsQ[i]}%`);
    }

    const query = `SELECT id, name FROM Streets WHERE ${conditions.join(' AND ')} LIMIT 30`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Fetch GeoJSON geometry for a street
router.get('/api/streets/:id/geometry', (req, res) => {
    db.get('SELECT name, lat, lng FROM Streets WHERE id = ?', [req.params.id], async (err, street) => {
        if (err || !street) return res.status(404).json({ error: 'Rua não encontrada' });

        try {
            const query = `
                [out:json];
                area[name="Ubá"][admin_level=8]->.searchArea;
                way["highway"]["name"="${street.name}"](area.searchArea);
                out geom;
            `;

            const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 10000
            });

            if (response.data && response.data.elements && response.data.elements.length > 0) {
                const coordinates = [];
                response.data.elements.forEach(el => {
                    if (el.type === 'way' && el.geometry) {
                        const line = el.geometry.map(pt => [pt.lon, pt.lat]);
                        coordinates.push(line);
                    }
                });

                if (coordinates.length > 0) {
                    const geojson = {
                        type: 'MultiLineString',
                        coordinates: coordinates
                    };
                    return res.json({ success: true, geojson: geojson, center: { lat: street.lat, lng: street.lng } });
                }
            }
            res.json({ success: false, center: { lat: street.lat, lng: street.lng } });
        } catch (error) {
            res.json({ success: false, center: { lat: street.lat, lng: street.lng } });
        }
    });
});

// Submit a community report
router.post('/api/reports', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Faça login com Google para relatar.' });

    // In real scenario we check if user is banned
    if (req.user.isBanned) return res.status(403).json({ error: 'Você está banido.' });

    const { streetId, status, markers } = req.body;

    // Suporta o formato antigo sem array de markers para retrocompatibilidade ou 1 marcação central.
    if (!streetId || !status) return res.status(400).json({ error: 'Faltam dados essenciais.' });

    // Se for Admin ou Big-Boss, o relato é inserido direto como Oficial sem validação ou denúncia possível
    const isOfficial = (req.user.role === 'admin' || req.user.role === 'big_boss') ? 1 : 0;

    const points = (Array.isArray(markers) && markers.length > 0) ? markers.slice(0, 3) : [{ lat: null, lng: null }];
    const errors = [];

    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO Reports (streetId, userId, status, description, isOfficial, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)`);

        points.forEach(p => {
            stmt.run([streetId, req.user.id, status, '', isOfficial, p.lat, p.lng], function (err) {
                if (err) errors.push(err);
            });
        });

        stmt.finalize(() => {
            res.json({ success: true, isOfficial, errors });
        });
    });
});

// Report a fake news (Moderation logic)
router.post('/api/reports/:id/flag', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Faça login' });
    const reportId = req.params.id;
    const userId = req.user.id;

    // Check if user already flagged
    db.get(`SELECT id FROM Flags WHERE reportId = ? AND userId = ?`, [reportId, userId], (err, flag) => {
        if (err) return res.status(500).json({ error: err.message });
        if (flag) return res.status(400).json({ error: 'Você já denunciou este alerta.' });

        db.serialize(() => {
            db.run(`INSERT INTO Flags (reportId, userId) VALUES (?, ?)`, [reportId, userId]);
            db.run(`UPDATE Reports SET reportCount = reportCount + 1 WHERE id = ?`, [reportId], async function (err) {
                if (err) return res.status(500).json({ error: err.message });

                // If reached 10 flags, ban user
                db.get(`SELECT reportCount, userId as authorId FROM Reports WHERE id = ?`, [reportId], (err, row) => {
                    if (row && row.reportCount >= 10) {
                        db.run(`UPDATE Users SET isBanned = 1 WHERE id = ?`, [row.authorId]);
                    }
                });

                res.json({ success: true });
            });
        });
    });
});

// Admin / Big-Boss only: Adicionar Rua Dinamicamente
router.post('/api/streets', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Faça login' });
    if (req.user.role !== 'admin' && req.user.role !== 'big_boss') return res.status(403).json({ error: 'Permissão negada. Requer nível Admin ou Big-Boss.' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da rua é obrigatório' });

    try {
        // Auto-Geocode central point using Nominatim
        const url = `https://nominatim.openstreetmap.org/search`;
        const response = await axios.get(url, {
            params: { q: `${name}, Ubá, Minas Gerais`, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'UbaApp/1.0' }
        });

        let lat = -21.1215; // default fallback center of Uba
        let lng = -42.9427;

        if (response.data && response.data.length > 0) {
            lat = parseFloat(response.data[0].lat);
            lng = parseFloat(response.data[0].lon);
        }

        db.run(`INSERT INTO Streets (name, lat, lng) VALUES (?, ?, ?)`, [name, lat, lng], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, streetId: this.lastID, lat, lng });
        });
    } catch (e) {
        return res.status(500).json({ error: 'Erro ao buscar coordenadas.' });
    }
});

// Admin / Big-Boss only: Remover Rua Dinamicamente
router.delete('/api/streets/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Faça login' });
    if (req.user.role !== 'admin' && req.user.role !== 'big_boss') return res.status(403).json({ error: 'Permissão negada. Requer nível Admin ou Big-Boss.' });

    db.run('DELETE FROM Streets WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Admin / Big-Boss only: Remover Relato Dinamicamente
router.delete('/api/reports/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Faça login' });
    if (req.user.role !== 'admin' && req.user.role !== 'big_boss') return res.status(403).json({ error: 'Permissão negada.' });

    db.run('DELETE FROM Reports WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Big-Boss Only: Promover E-mail a Admin Autoridade (Ghost Account Handler)
router.post('/api/admins', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Faça login primeiro.' });
    if (req.user.role !== 'big_boss') return res.status(403).json({ error: 'Acesso Negado. Apenas o Big-Boss pode nomear Autoridades.' });

    const { email } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail inválido fornecido.' });

    const targetEmail = email.toLowerCase().trim();

    // Check if user already exists
    db.get('SELECT id, role FROM Users WHERE email = ?', [targetEmail], (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro de Banco de Dados.' });

        if (user) {
            // User exists, just update role
            if (user.role === 'big_boss') return res.status(400).json({ error: 'Este usuário já é o dono do sistema.' });

            db.run("UPDATE Users SET role = 'admin' WHERE id = ?", [user.id], function (updateErr) {
                if (updateErr) return res.status(500).json({ error: 'Erro ao promover conta existente.' });
                return res.json({ success: true, message: 'Usuário promovido! Ele agora é uma Autoridade (👑).' });
            });
        } else {
            // User does not exist, create a GHOST ACCOUNT pre-loaded with 'admin' role
            // googleId, name and photoUrl are NULL for now. When they login, Passport bridges the gap.
            db.run(
                "INSERT INTO Users (email, role, isBanned) VALUES (?, 'admin', 0)",
                [targetEmail],
                function (insertErr) {
                    if (insertErr) return res.status(500).json({ error: 'Erro ao criar conta administrativa fantasma.' });
                    return res.json({ success: true, message: 'Conta Oculta ativada! Quando este e-mail logar a primeira vez, já nascerá Autoridade.' });
                }
            );
        }
    });
});

module.exports = router;
