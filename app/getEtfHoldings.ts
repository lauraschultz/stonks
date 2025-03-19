"use server";
import puppeteer from "puppeteer";

export type Stock = {
	ticker: string;
	percent: number;
};
export type EtfHoldings = {
	ticker: string;
	holdings: Stock[];
};

async function getEtfHoldings(
	prevState: any,
	queryData: any
): Promise<EtfHoldings> {
	console.log({ prevState, queryData });
	const etf = queryData.get("etf");
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(
		`https://www.schwab.wallst.com/schwab/Prospect/research/etfs/schwabETF/index.asp?type=holdings&symbol=${etf}`
	);

	await page.locator('ul.paginationOptions li[rowcount="60"]').click();

	await page.locator("tbody#tthHoldingsTbody").wait();

	let holdings = new Array<Stock>();

	let currentPage = 1;
	let morePages = true;

	while (morePages) {
		const rows = await page.$$("tbody#tthHoldingsTbody tr");

		for (const row of rows) {
			const ticker =
				(await row.$eval("td.symbol", (el) => el.textContent)) || "";

			const percent =
				+(
					(await row.$eval("td:nth-of-type(3)", (el) =>
						el.getAttribute("tsraw")
					)) || 0
				) / 100;
			holdings.push({ ticker, percent });
		}

		try {
			await page.click(`ul.pageControls li[pagenumber="${currentPage + 1}"]`);
			currentPage++;
		} catch (e) {
			morePages = false;
		}
	}
	return Promise.resolve({ ticker: etf, holdings });
}

export default getEtfHoldings;
