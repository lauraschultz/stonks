import { EtfStock } from "./EtfStock";

export type EtfHoldings = {
	symbol: string;
	name: string;
	holdings: EtfStock[];
};
