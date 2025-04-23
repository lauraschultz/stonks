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
import { Settings } from "./types/Settings";

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
	etfHoldingsRebalanced: EtfHoldings[],
	settings: Settings
): PortfolioStock[] {
	const totalPortfolioValue =
		portfolio.securitiesAccount.currentBalances.equity;
	console.log(portfolio.securitiesAccount.currentBalances);
	console.log(portfolio.securitiesAccount.initalBalances);

	const stockPortfolio: Map<
		string,
		Omit<PortfolioStock, "diffQuantityNormal" | "diffPercentNormal">
	> = new Map();

	portfolioEtf.forEach((etf) => {
		const balancedEtf = etfHoldingsRebalanced.find(
			(e) => e.symbol === etf.symbol
		);
		balancedEtf?.holdings.forEach((stock) => {
			const quotePrice = stockQuotes[stock.symbol]?.quote?.askPrice;
			if (quotePrice) {
				const curr = stockPortfolio.get(stock.symbol);
				const portfolioPosition = portfolio.securitiesAccount.positions.find(
					(p) => p.instrument.symbol === stock.symbol
				);
				const currentQuantity = portfolioPosition?.longQuantity || 0;
				const currentPercent =
					(portfolioPosition?.marketValue || 0) / totalPortfolioValue;

				const portfolioPercent =
					(curr?.portfolioPercent ?? 0) + (etf.percent / 100) * stock.percent;
				stockPortfolio.set(stock.symbol, {
					symbol: stock.symbol,
					quotePrice,
					portfolioPercent,
					diffPercentRaw: portfolioPercent - currentPercent,
					currentQuantity,
				});
			} else {
				console.log(`Cannot find value for ${stock.symbol}`);
				console.log(stockQuotes[stock.symbol]);
			}
		});
	});

	const stockPortfolioArr = stockPortfolio.values().toArray();
	let balancedTotalPercent = stockPortfolioArr.reduce((acc, curr) => {
		if (curr.diffPercentRaw > 0) return curr.diffPercentRaw + acc;
		return acc;
	}, 0);

	const stockPortfolioArrBalanced = stockPortfolioArr.map((s) => {
		const diffPercentNormal = s.diffPercentRaw / balancedTotalPercent;
		const maxSpend =
			diffPercentNormal *
			portfolio.securitiesAccount.currentBalances.cashBalance;
		return {
			...s,
			diffQuantityNormal: maxSpend / s.quotePrice,
			diffPercentNormal,
		};
	});
	return stockPortfolioArrBalanced;
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
	// console.log(stockQuotes);

	return etfToStockV1(portfolio, portfolioEtf, stockQuotes, etfHoldings, {
		sell: false,
		impatience: 0,
		ramdomness: 0,
	});
}

export async function buildOrderListV1(
	portfolioStocks: PortfolioStock[],
	portfolio: SchwabUserPortfolio
): Promise<Order[]> {
	// no selling
	return portfolioStocks
		.map(({ symbol, diffQuantityNormal: diffQuantity }) => {
			return {
				instruction: "BUY" as "BUY",
				quantity: diffQuantity,
				symbol,
			};
		})
		.sort((a, b) => b.quantity - a.quantity);
}
