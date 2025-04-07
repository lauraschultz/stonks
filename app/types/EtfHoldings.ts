import { EtfStock } from "./EtfStock";

export type EtfHoldings = {
	ticker: string;
	holdings: EtfStock[];
};
