/* eslint-disable @typescript-eslint/no-var-requires */
const puppeteer = require('puppeteer');

module.exports = async function ssr(url) {
    const start = Date.now();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.waitForSelector('body');
    } catch (err) {
        console.error(err);
        throw new Error('page.goto/waitForSelector timed out.');
    }

    const html = await page.content(); // serialized HTML of page DOM.
    await browser.close();

    const ttRenderMs = Date.now() - start;
    console.info(`Headless rendered page in: ${ttRenderMs}ms`); // cache rendered page.

    return { html, ttRenderMs };
}
