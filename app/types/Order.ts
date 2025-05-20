export type Order = {
	symbol: string;
	quantity: number;
	instruction: "BUY" | "SELL";
	displayQuantity: number;
};
