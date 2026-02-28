const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const logStream = fs.createWriteStream('debug.log');

    page.on('console', msg => logStream.write(`DOM LOG: ${msg.text()}\n`));
    page.on('pageerror', err => logStream.write(`DOM ERROR: ${err.toString()}\n`));

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        logStream.write("Typing 'avenida'...\n");
        await page.focus('#street-search');
        await page.keyboard.type('avenida', { delay: 100 });

        await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
        logStream.write(`TEST EXCEPTION: ${e.toString()}\n`);
    } finally {
        await browser.close();
        logStream.end();
    }
})();
