const cron = require('node-cron');
const db = require('./db');

// Mocked NLP Analysis function to simulate checking an official source text
async function analyzeTextWithNLP(text) {
    // In a real app, send text to Gemini/OpenAI API and return JSON
    const lower = text.toLowerCase();
    if (!lower.includes('ubá')) return null;

    let status = 'parcial';
    if (lower.includes('desabamento') || lower.includes('ponte caiu')) status = 'bridge';
    if (lower.includes('interdição total') || lower.includes('bloqueada')) status = 'total';

    // Quick mock extraction
    if (lower.includes('beira-rio')) return { streetName: 'Avenida Beira-Rio', status };
    if (lower.includes('mg-447')) return { streetName: 'MG-447', status };
    if (lower.includes('major fusaro')) return { streetName: 'Ponte Major Fusaro', status };

    return null;
}

// Main Cron Job Logic
function startScraper() {
    console.log('Automated Scraping Engine Initialized. Running every 30 mins.');

    cron.schedule('*/30 * * * *', async () => {
        console.log('[Scraping/NLP] Running the 30min routine...');

        // 1. MOCK: Fetching data from Prefeito Damato or PMRv (We simulate grabbing a new post)
        const mockLatestPost = "Boletim Defesa Civil Ubá: Acesso a MG-447 bloqueada por completo devido à grande quantidade de lama.";

        // 2. Pass to AI
        const nlpResult = await analyzeTextWithNLP(mockLatestPost);

        if (nlpResult) {
            console.log(`[NLP Validation] AI found an incident in: ${nlpResult.streetName}`);

            // 3. Update the Database
            db.get('SELECT id FROM Streets WHERE name LIKE ?', [`%${nlpResult.streetName}%`], (err, street) => {
                if (err || !street) return;

                // Check if community already reported it (Cross-check)
                db.get('SELECT id FROM Reports WHERE streetId = ?', [street.id], (err, report) => {
                    if (err) return;

                    if (report) {
                        // Validate existing community report
                        db.run('UPDATE Reports SET isOfficial = 1, status = ? WHERE id = ?', [nlpResult.status, report.id]);
                        console.log(`✅ [Validation] Community report validation confirmed for ${nlpResult.streetName}!`);
                    } else {
                        // Create brand new official auto-report
                        db.run(
                            "INSERT INTO Reports (streetId, userId, status, description, isOfficial) VALUES (?, NULL, ?, ?, 1)",
                            [street.id, nlpResult.status, "Extraído via IA dos canais oficiais."]
                        );
                        console.log(`📝 [Auto-Post] System created an Official Alert for ${nlpResult.streetName}.`);
                    }
                });
            });
        }
    });
}

module.exports = { startScraper };
