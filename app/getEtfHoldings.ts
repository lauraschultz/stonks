"use server";
import puppeteer from "puppeteer";
import { EtfHoldings } from "./types/EtfHoldings";
import { Stock } from "./types/Stock";

async function getEtfHoldings(
	prevState: any,
	queryData: any
): Promise<EtfHoldings> {
	const etf = queryData.get("etf");
	console.log({ queryData });
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(
		`https://www.schwab.wallst.com/schwab/Prospect/research/etfs/schwabETF/index.asp?type=holdings&symbol=${etf}`
	);

	await page.locator('ul.paginationOptions li[rowcount="60"]').click();

	let holdings = new Array<Stock>();

	let currentPage = 1;
	let morePages = true;

	while (morePages) {
		await page.locator("tbody#tthHoldingsTbody").wait();

		const rows = await page.$$("tbody#tthHoldingsTbody tr");

		for (const row of rows) {
			const ticker =
				(await row.$eval("td.symbol", (el) => el.textContent)) || "";

			const name =
				(await row.$eval("td:nth-of-type(2)", (el) => el.textContent)) || "";

			const percent =
				+(
					(await row.$eval("td:nth-of-type(3)", (el) =>
						el.getAttribute("tsraw")
					)) || 0
				) / 100;
			holdings.push({ ticker, name, percent });
		}

		try {
			await page.click(`ul.pageControls li[pagenumber="${currentPage + 1}"]`);
			currentPage++;
			await page.waitForNetworkIdle();
		} catch (e) {
			morePages = false;
		}
	}
	return Promise.resolve({ ticker: etf, holdings });
}

export default getEtfHoldings;
