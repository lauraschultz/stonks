import axios from "axios";
import { getToken } from "./SchwabApi";
import { EquityQuote } from "./types/EquityQuote";

export async function getStockQuotes(
	tickers: string[]
): Promise<{ [symbol: string]: EquityQuote }> {
	const limit = 200;
	const requests = Math.ceil(tickers.length / limit);
	const token = await getToken();

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

	const prom = new Array(requests)
		.fill(null)
		.map((_, i) => genRequest(i * limit, (i + 1) * limit));
	return await Promise.all(prom).then((result) =>
		result
			.map((r) => r.data)
			.reduce((acc, curr) => Object.assign(acc, curr), {})
	);
	// .catch(console.error);
}
