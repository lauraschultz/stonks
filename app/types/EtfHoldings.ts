import { Stock } from "./Stock";

export type EtfHoldings = {
	ticker: string;
	holdings: Stock[];
};
