"use server";

import { getEtfHoldings } from "./getEtfHoldings";
import { getStockQuotes } from "./getStockQuotes";
import { getNoGoList, getSettings } from "./local";
import { getUserPortfolio } from "./SchwabApi";
import { EquityQuote } from "./types/EquityQuote";
import { EtfHoldings } from "./types/EtfHoldings";
import { Order } from "./types/Order";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { PortfolioStock } from "./types/PortfolioStock";
import { SchwabUserPortfolio } from "./types/SchwabUserPortfolio";
import { Settings } from "./types/Settings";

const validateEquityType = (equityQuote: EquityQuote) => {
	if (equityQuote?.assetMainType !== "EQUITY") return false;
	if (!equityQuote.assetSubType) return true;
	return (
		equityQuote.assetSubType === "COE" || equityQuote.assetSubType === "ADR"
	);
};

function etfToStockV1(
	portfolio: SchwabUserPortfolio,
	portfolioEtf: PortfolioEtf[],
	stockQuotes: { [symbol: string]: EquityQuote },
	etfHoldings: EtfHoldings[],
	settings: Settings,
	noGoList: string[]
): PortfolioStock[] {
	const rebalance = (etfHoldings: EtfHoldings): EtfHoldings => {
		// only include stocks which are not in nogo list AND for which we know the ticker symbol AND for which we have a stock quote
		const filteredStocks = etfHoldings.holdings.filter(({ symbol }) => {
			if (
				!noGoList.includes(symbol) &&
				symbol.match(/[a-zA-Z]+/) &&
				validateEquityType(stockQuotes[symbol])
			)
				return true;
			return false;
		});

		const totalPercent = filteredStocks.reduce(
			(acc, curr) => acc + curr.percent,
			0
		);

		// console.log({ totalPercent });

		return {
			...etfHoldings,
			holdings: filteredStocks.map((st) => ({
				...st,
				percent: st.percent / totalPercent,
			})),
		};
	};

	const etfHoldingsRebalanced = etfHoldings.map(rebalance);

	const totalPortfolioValue =
		portfolio.securitiesAccount.currentBalances.equity;

	const portfolioInvestedPercent =
		portfolioEtf.reduce((acc, curr) => acc + curr.percent, 0) / 100;
	const toSpend = Math.min(
		portfolio.securitiesAccount.currentBalances.cashBalance,
		totalPortfolioValue * portfolioInvestedPercent
	);

	console.log({ portfolioInvestedPercent, toSpend });

	const stockPortfolio: Map<
		string,
		Omit<
			PortfolioStock,
			"diffQuantityNormal" | "diffPercentNormal" | "orderQuantity"
		>
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

	// now, we need to divide available funds among the non-negative equities
	// first, find the total % from non-neg equities
	const stockPortfolioArr = stockPortfolio.values().toArray();
	let balancedTotalPercent = stockPortfolioArr.reduce((acc, curr) => {
		if (curr.diffPercentRaw > 0) return curr.diffPercentRaw + acc;
		return acc;
	}, 0);

	console.log({ balancedTotalPercent });

	// now divide by balancedTotalPercent to normalize to 100%
	let stockPortfolioArrBalanced = stockPortfolioArr.map((s) => {
		const diffPercentNormal = s.diffPercentRaw / balancedTotalPercent;
		const maxSpend = diffPercentNormal * toSpend;
		return {
			...s,
			// should these be negative??
			// helpful for debugging but misleading, since neg values aren't included in normalized values
			diffQuantityNormal: maxSpend / s.quotePrice,
			diffPercentNormal,
		};
	});

	const maxDiffPercentNormal = stockPortfolioArrBalanced.reduce(
		(acc, curr) =>
			curr.diffPercentNormal > acc ? curr.diffPercentNormal : acc,
		0
	);

	// get amount spent by buying whole number stocks
	let spendAmountRemaining = stockPortfolioArrBalanced.reduce((acc, curr) => {
		return acc - Math.floor(curr.diffQuantityNormal);
	}, toSpend);

	console.log({ spendAmountRemaining });

	// order all stocks according to fractional diff quantity
	stockPortfolioArrBalanced.sort((a, b) => {
		const rank = [a, b].map(
			(v) =>
				(v.diffQuantityNormal % 1) * settings.weightDiffQuantity +
				(v.diffPercentNormal / maxDiffPercentNormal) *
					settings.weightPortfolioPercent +
				(v.currentQuantity > 0 ? 0 : 1) * settings.weightDiversity
		);

		return rank[1] - rank[0];
	});

	// determine quantity of each to order
	stockPortfolioArrBalanced = stockPortfolioArrBalanced.map((eq) => {
		let orderQuantity = Math.floor(Math.max(0, eq.diffQuantityNormal));
		if (spendAmountRemaining >= eq.quotePrice) {
			orderQuantity++;
			spendAmountRemaining -= eq.quotePrice;
		} else if (settings.patience) {
			spendAmountRemaining = 0;
		}

		return { ...eq, orderQuantity };
	});

	return stockPortfolioArrBalanced as PortfolioStock[];
}

export async function etfToStock(portfolioEtf: PortfolioEtf[]) {
	const portfolio = await getUserPortfolio();
	const nogoList = await getNoGoList();
	const etfHoldings = await Promise.all(
		portfolioEtf.map((etf) => {
			return getEtfHoldings(etf.symbol);
		})
	);

	const allStocks = etfHoldings
		.map((etf) => etf.holdings)
		.flat()
		.map((holdings) => holdings.symbol);
	const stockQuotes = await getStockQuotes([...new Set(allStocks)]);
	const settings = await getSettings();

	return etfToStockV1(
		portfolio,
		portfolioEtf,
		stockQuotes,
		etfHoldings,
		settings,
		nogoList
	);
}

export async function buildOrderListV1(
	portfolioStocks: PortfolioStock[],
	portfolio: SchwabUserPortfolio
): Promise<Order[]> {
	// no selling
	return portfolioStocks
		.map(({ symbol, diffQuantityNormal }) => {
			return {
				instruction: "BUY" as "BUY",
				quantity: Math.floor(Math.max(0, diffQuantityNormal)),
				symbol,
			};
		})
		.sort((a, b) => b.quantity - a.quantity);
}
