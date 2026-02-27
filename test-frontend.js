const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        console.log("Typing 'avenida'...");
        await page.focus('#street-search');
        await page.keyboard.type('avenida', { delay: 100 });

        // Wait 5 seconds for fetch and DOM updates
        await new Promise(r => setTimeout(r, 5000));

        const dropdownHtml = await page.evaluate(() => {
            const el = document.getElementById('street-dropdown');
            return {
                html: el ? el.innerHTML.slice(0, 150) + '...' : 'NOT_FOUND',
                display: el ? window.getComputedStyle(el).display : 'N/A',
                classes: el ? el.className : 'N/A'
            };
        });

        console.log("Dropdown state:", dropdownHtml);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
