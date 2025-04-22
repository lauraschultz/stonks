export type SchwabOrders = {
	// this is returned from Schwab's API
	// more fields are returned, can define more as needed
	quantity: number; // total
	filledQuantity: number;
	remainingQuantity: number;
	orderLegCollection: {
		instrument: {
			symbol: string;
		};
		instruction: "BUY" | "SELL";
	}[];
	status: "PENDING_ACTIVATION" | "FILLED";
};
