const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({args: ['--disable-web-security'], executablePath: '/usr/bin/chromium-browser'});
	const page = await browser.newPage();

	await page.setViewport({width: parseInt(process.argv[4]), height: parseInt(process.argv[5])});
	await page.emulateMedia('screen');
	await page.goto(process.argv[2], {waitUntil: 'networkidle0'});

	await page.pdf({path: process.argv[3], width: parseInt(process.argv[4]), height: parseInt(process.argv[5]), margin: {top: 0, bottom: 0, left: 0, right: 0}, printBackground: true});

	await browser.close();
})();
