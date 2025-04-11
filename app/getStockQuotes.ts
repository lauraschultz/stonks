import axios from "axios";
import { handleAuth } from "./SchwabApi";

export async function getStockQuotes(tickers: string[]): Promise<any> {
	const limit = 200;
	const requests = Math.ceil(tickers.length / limit);
	const token = await handleAuth();

	const genRequest = async (start: number, end: number) => {
		console.log(`Fetching quotes for: ${tickers.slice(start, end).join(",")}`);
		return axios({
			method: "GET",
			url: "https://api.schwabapi.com/marketdata/v1/quotes",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
			params: {
				symbols: tickers.slice(start, end).join(","),
			},
		});
	};

	try {
		const prom = new Array(requests)
			.fill(null)
			.map((_, i) => genRequest(i * limit, (i + 1) * limit));
		return await Promise.all(prom)
			.then((result) =>
				result
					.map((r) => r.data)
					.reduce((acc: any, curr: any) => Object.assign(acc, curr), {})
			)
			.catch(console.error);
	} catch (e) {
		console.error(e);
	}
}
