export type PortfolioStock = {
	symbol: string;
	quotePrice: number;
	portfolioPercent: number;
	diffPercentRaw: number;
	diffPercentNormal: number;
	diffQuantityNormal: number;
	currentQuantity: number;
};
