export type SchwabUserPortfolio = {
	// this is returned from Schwab's API
	// more fields are returned, can define more as needed
	securitiesAccount: {
		positions: {
			longQuantity: number;
			settledLongQuantity: number;
			marketValue: number;
			instrument: {
				symbol: string;
			};
		}[];
		initalBalances: {
			cashBalance: number; // uninvested
			equity: number;
			accountValue: number;
		};
		currentBalances: {
			cashBalance: number; // uninvested
			equity: number;
		};
	};
};
