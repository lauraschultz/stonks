export type EquityQuote = {
	// this is returned from Schwab's API
	// more fields are returned, can define more as needed
	symbol: string;
	quote: {
		askPrice: number;
	};
};
