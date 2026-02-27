const { scrapeSocialMedia } = require('./scraper.js');

(async () => {
    console.log("🚀 Iniciando Teste do Puppeteer Local...");
    try {
        const result = await scrapeSocialMedia();
        console.log("\n==================== RESULTADO FINAL ====================");
        console.log(result);
        console.log("=========================================================\n");
        console.log("✅ Feche com CTRL+C");
    } catch (e) {
        console.error("❌ Erro ao rodar teste:", e);
    }
})();
