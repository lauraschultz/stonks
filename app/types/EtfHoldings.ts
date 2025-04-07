import { EtfStock } from "./EtfStock";

export type EtfHoldings = {
	symbol: string;
	holdings: EtfStock[];
};
