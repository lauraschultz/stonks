"use server";

import { getEtfHoldings } from "./getEtfHoldings";
import { getStockQuotes } from "./getStockQuotes";
import { getNoGoList } from "./local";
import { getUserPortfolio } from "./SchwabApi";
import { EtfHoldings } from "./types/EtfHoldings";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { PortfolioStock } from "./types/PortfolioStock";

const rebalance = (
	etfHoldings: EtfHoldings,
	noGoList: string[]
): EtfHoldings => {
	// only include stocks which are not in nogo list and for which we know the ticker symbol
	const filteredStocks = etfHoldings.holdings.filter(
		(st) => !noGoList.includes(st.ticker) && st.ticker.match(/[a-zA-Z]+/)
	);
	const totalPercent = filteredStocks.reduce(
		(acc, curr) => acc + curr.percent,
		0
	);

	return {
		ticker: etfHoldings.ticker,
		holdings: filteredStocks.map((st) => ({
			...st,
			percent: st.percent / totalPercent,
		})),
	};
};

function etfToStockV1(
	portfolio: any,
	portfolioEtf: PortfolioEtf[],
	stockQuotes: any,
	etfHoldingsRebalanced: EtfHoldings[]
): Map<string, PortfolioStock> {
	const uninvested = portfolio.securitiesAccount.currentBalances.cashBalance;
	const totalPortfolioValue =
		uninvested +
		portfolio.securitiesAccount.positions
			.map((p: any) => p.settledLongQuantity * p.marketValue)
			.reduce((acc: number, curr: number) => acc + curr, 0);

	const stockPortfolio: Map<string, PortfolioStock> = new Map();

	portfolioEtf.forEach((etf) => {
		const balancedEft = etfHoldingsRebalanced.find(
			(e) => e.ticker === e.ticker
		);
		balancedEft?.holdings.forEach((stock) => {
			const desiredValue =
				totalPortfolioValue * (etf.percent / 100) * stock.percent;
			const quotePrice = stockQuotes[stock.ticker]?.quote?.askPrice;
			if (quotePrice) {
				const curr = stockPortfolio.get(stock.ticker);
				const currentQuantity =
					portfolio.securitiesAccount.positions.find(
						(p: any) => p.instrument.symbol === stock.ticker
					)?.settledLongQuantity || 0;

				stockPortfolio.set(stock.ticker, {
					symbol: stock.ticker,
					quotePrice,
					portfolioPercent:
						(curr?.portfolioPercent ?? 0) + (etf.percent / 100) * stock.percent,
					quantityRaw: (curr?.quantityRaw ?? 0) + desiredValue / quotePrice,
					diff:
						(curr?.quantityRaw ?? 0) +
						desiredValue / quotePrice -
						currentQuantity,
				});
			} else {
				console.log(`Cannot find value for ${stock.ticker}`);
				console.log(stockQuotes[stock.ticker]);
			}
		});
	});

	return stockPortfolio;
}

export async function etfToStock(portfolioEtf: PortfolioEtf[]) {
	const portfolio = await getUserPortfolio();
	const nogoList = await getNoGoList();
	const etfHoldings = await Promise.all(
		portfolioEtf.map((etf) => {
			return getEtfHoldings(etf.ticker);
		})
	).then((result) => result.map((etf) => rebalance(etf, nogoList)));

	const allStocks = etfHoldings
		.map((etf) => etf.holdings)
		.flat()
		.map((holdings) => holdings.ticker);
	const stockQuotes = await getStockQuotes([...new Set(allStocks)]);

	return etfToStockV1(portfolio[0], portfolioEtf, stockQuotes, etfHoldings);
}
