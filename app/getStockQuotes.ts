import axios from "axios";
import { handleAuth } from "./SchwabApi";

export async function getStockQuotes(tickers: string[]): Promise<any> {
	const limit = 400;
	const requests = Math.ceil(tickers.length / limit);
	const token = await handleAuth();

	const genRequest = (start: number, end: number) => {
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
		// TODO this doesnt work!
		return Promise.all(
			new Array(requests).fill(null).map((_, i) =>
				genRequest(i * limit, (i + 1) * limit)
					.then((res) => res.data)
					.catch(console.error)
			)
		).then((result) => result.flat()[0]);
	} catch (e) {
		console.error(e);
	}
}
