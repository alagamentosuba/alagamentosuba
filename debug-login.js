const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    let browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        console.log("-> Going to Instagram login...");
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2', timeout: 30000 });

        await new Promise(r => setTimeout(r, 5000));

        const inputs = await page.evaluate(() => {
            const els = document.querySelectorAll('input');
            return Array.from(els).map(e => ({
                name: e.name,
                type: e.type,
                aria: e.getAttribute('aria-label'),
                id: e.id,
                class: e.className
            }));
        });

        console.log("=== FOUND INPUTS ===");
        console.log(JSON.stringify(inputs, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
