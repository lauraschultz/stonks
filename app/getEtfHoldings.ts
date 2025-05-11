"use server";
import puppeteer from "puppeteer";
import { EtfHoldings } from "./types/EtfHoldings";
import { EtfStock } from "./types/EtfStock";
import { getEtfCache, setEtfCache } from "./local";

export async function getEtfHoldingsAction(
	prevState: any,
	queryData: any
): Promise<EtfHoldings> {
	const symbol = queryData.get("etf");
	return getEtfHoldings(symbol);
}

export async function getEtfHoldings(symbol: string): Promise<EtfHoldings> {
	const cachedFile = await getEtfCache(symbol);
	if (cachedFile) return Promise.resolve(cachedFile);

	console.log(`no valid cache entry found for ${symbol}, scraping schwab`);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	page.setDefaultTimeout(10000);

	try {
		await page.goto(
			`https://www.schwab.wallst.com/schwab/Prospect/research/etfs/schwabETF/index.asp?type=holdings&symbol=${symbol}`
		);
		try {
			await page.locator('ul.paginationOptions li[rowcount="60"]').click();
		} catch (e) {
			// allowed to fail, might have less than 20 holdings
		}

		const name =
			(await page.$eval("h2", (el) => el.textContent))?.split(" ETF ")[0] || "";

		let holdings = new Array<EtfStock>();

		let currentPage = 1;
		let morePages = true;

		while (morePages) {
			await page.locator("tbody#tthHoldingsTbody").wait();

			const rows = await page.$$("tbody#tthHoldingsTbody tr");

			for (const row of rows) {
				const symbol =
					(await row.$eval("td.symbol", (el) => el.textContent)) || "";

				const name =
					(await row.$eval("td:nth-of-type(2)", (el) => el.textContent)) || "";

				const percent = +(
					(await row.$eval("td:nth-of-type(3)", (el) =>
						el.getAttribute("tsraw")
					)) || 0
				);
				holdings.push({ symbol, name, percent });
			}

			try {
				await page.click(`ul.pageControls li[pagenumber="${currentPage + 1}"]`);
				currentPage++;
				await page.waitForNetworkIdle();
			} catch (e) {
				morePages = false;
			}
		}

		const etfHoldings = { symbol, holdings, name };
		await setEtfCache(symbol, etfHoldings);
		console.log(`finished fetching ${symbol}`);
		return Promise.resolve(etfHoldings);
	} catch (e) {
		await page.screenshot({
			path: `screenshots/failed_${symbol}_${new Date().getTime()}.png`,
		});
		const cachedFile = await getEtfCache(symbol, false);
		if (cachedFile) return Promise.resolve(cachedFile);

		throw new Error(
			`${e}
			
			Not able to scrape for ${symbol} and no cache entry found.`
		);
	}
}
