"use server";

import { getEtfHoldings } from "./getEtfHoldings";
import { getStockQuotes } from "./getStockQuotes";
import { getNoGoList } from "./local";
import { getUserPortfolio } from "./SchwabApi";
import { EquityQuote } from "./types/EquityQuote";
import { EtfHoldings } from "./types/EtfHoldings";
import { Order } from "./types/Order";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { PortfolioStock } from "./types/PortfolioStock";
import { SchwabUserPortfolio } from "./types/SchwabUserPortfolio";

const rebalance = (
	etfHoldings: EtfHoldings,
	noGoList: string[]
): EtfHoldings => {
	// only include stocks which are not in nogo list and for which we know the ticker symbol
	const filteredStocks = etfHoldings.holdings.filter(
		(st) => !noGoList.includes(st.symbol) && st.symbol.match(/[a-zA-Z]+/)
	);
	const totalPercent = filteredStocks.reduce(
		(acc, curr) => acc + curr.percent,
		0
	);

	return {
		...etfHoldings,
		holdings: filteredStocks.map((st) => ({
			...st,
			percent: st.percent / totalPercent,
		})),
	};
};

function etfToStockV1(
	portfolio: SchwabUserPortfolio,
	portfolioEtf: PortfolioEtf[],
	stockQuotes: { [symbol: string]: EquityQuote },
	etfHoldingsRebalanced: EtfHoldings[]
): Map<string, PortfolioStock> {
	const totalPortfolioValue =
		portfolio.securitiesAccount.currentBalances.equity;

	const stockPortfolio: Map<string, PortfolioStock> = new Map();

	portfolioEtf.forEach((etf) => {
		const balancedEtf = etfHoldingsRebalanced.find(
			(e) => e.symbol === etf.symbol
		);
		balancedEtf?.holdings.forEach((stock) => {
			const desiredValue =
				totalPortfolioValue * (etf.percent / 100) * stock.percent;
			const quotePrice = stockQuotes[stock.symbol]?.quote?.askPrice;
			if (quotePrice) {
				const curr = stockPortfolio.get(stock.symbol);
				const currentQuantity =
					portfolio.securitiesAccount.positions.find(
						(p) => p.instrument.symbol === stock.symbol
					)?.longQuantity || 0;

				const quantityRaw =
					(curr?.quantityRaw ?? 0) + desiredValue / quotePrice;

				stockPortfolio.set(stock.symbol, {
					symbol: stock.symbol,
					quotePrice,
					portfolioPercent:
						(curr?.portfolioPercent ?? 0) + (etf.percent / 100) * stock.percent,
					quantityRaw,
					diff: quantityRaw - currentQuantity,
				});
				// console.log(`adding ${stock.symbol}`);
			} else {
				console.log(`Cannot find value for ${stock.symbol}`);
				console.log(stockQuotes[stock.symbol]);
			}
		});
	});

	// TODO rebalance again to account for missing symbols, holdings we don't want to sell

	return stockPortfolio;
}

export async function etfToStock(portfolioEtf: PortfolioEtf[]) {
	const portfolio = await getUserPortfolio();
	const nogoList = await getNoGoList();
	const etfHoldings = await Promise.all(
		portfolioEtf.map((etf) => {
			return getEtfHoldings(etf.symbol);
		})
	).then((result) => result.map((etf) => rebalance(etf, nogoList)));

	const allStocks = etfHoldings
		.map((etf) => etf.holdings)
		.flat()
		.map((holdings) => holdings.symbol);
	const stockQuotes = await getStockQuotes([...new Set(allStocks)]);

	return etfToStockV1(portfolio, portfolioEtf, stockQuotes, etfHoldings);
}

export async function buildOrderListV1(
	portfolioStocks: PortfolioStock[]
): Promise<Order[]> {
	// no selling
	return portfolioStocks
		.map(({ symbol, diff }) => ({
			instruction: "BUY" as "BUY",
			quantity: Math.floor(Math.max(0, diff)),
			symbol,
		}))
		.sort((a, b) => b.quantity - a.quantity);
}
