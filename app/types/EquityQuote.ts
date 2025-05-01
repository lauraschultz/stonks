export type EquityQuote = {
	// this is returned from Schwab's API
	// more fields are returned, can define more as needed
	assetMainType: "EQUITY" | "MUTUAL_FUND";
	assetSubType: "COE" | "MMF" | "ADR" | "ETF";
	symbol: string;
	quote: {
		askPrice: number;
	};
};
