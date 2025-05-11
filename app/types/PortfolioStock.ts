export type PortfolioStock = {
	symbol: string;
	quotePrice: number;
	portfolioPercent: number;
	diffPercentRaw: number;
	diffPercentNormal: number; // after accounting for neg. values
	diffQuantityNormal: number;
	currentQuantity: number;
	orderQuantity: number;
};
