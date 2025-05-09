import axios from "axios";
import { getToken } from "./SchwabApi";
import { EquityQuote } from "./types/EquityQuote";

export async function getStockQuotes(
	tickers: string[]
): Promise<{ [symbol: string]: EquityQuote }> {
	// return {
	// 	CCL: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 48522949,
	// 		symbol: "CCL",
	// 		extended: {
	// 			askPrice: 17.54,
	// 			askSize: 100,
	// 			bidPrice: 17.23,
	// 			bidSize: 2277,
	// 			lastPrice: 17.35,
	// 			lastSize: 55,
	// 			mark: 17.35,
	// 			quoteTime: 1745305032000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745304499000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 33945387,
	// 			avg1YearVolume: 26323484,
	// 			declarationDate: "2020-01-16T00:00:00Z",
	// 			divAmount: 0,
	// 			divExDate: "2020-02-20T00:00:00Z",
	// 			divFreq: 4,
	// 			divPayAmount: 0.5,
	// 			divPayDate: "2020-03-13T00:00:00Z",
	// 			divYield: 0,
	// 			eps: 1.43705,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-03-21T00:00:00Z",
	// 			nextDivExDate: "2020-05-20T00:00:00Z",
	// 			nextDivPayDate: "2020-06-15T00:00:00Z",
	// 			peRatio: 11.81741,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 28.72,
	// 			"52WeekLow": 13.78,
	// 			askMICId: "ARCX",
	// 			askPrice: 17.27,
	// 			askSize: 7,
	// 			askTime: 1745279992683,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 17.21,
	// 			bidSize: 1,
	// 			bidTime: 1745280000072,
	// 			closePrice: 17.99,
	// 			highPrice: 17.835,
	// 			lastMICId: "XADF",
	// 			lastPrice: 17.28,
	// 			lastSize: 830,
	// 			lowPrice: 17.05,
	// 			mark: 17.24,
	// 			markChange: -0.75,
	// 			markPercentChange: -4.16898277,
	// 			netChange: -0.71,
	// 			netPercentChange: -3.94663702,
	// 			openPrice: 17.59,
	// 			postMarketChange: 0.04,
	// 			postMarketPercentChange: 0.23201856,
	// 			quoteTime: 1745280000072,
	// 			securityStatus: "Normal",
	// 			totalVolume: 18735405,
	// 			tradeTime: 1745279984300,
	// 		},
	// 		reference: {
	// 			cusip: "143658300",
	// 			description: "CARNIVAL CORP",
	// 			exchange: "N",
	// 			exchangeName: "NYSE",
	// 			isHardToBorrow: false,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 17.24,
	// 			regularMarketLastSize: 1319782,
	// 			regularMarketNetChange: -0.75,
	// 			regularMarketPercentChange: -4.16898277,
	// 			regularMarketTradeTime: 1745276400002,
	// 		},
	// 	},
	// 	UAL: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 1211162058,
	// 		symbol: "UAL",
	// 		extended: {
	// 			askPrice: 66,
	// 			askSize: 458,
	// 			bidPrice: 65.08,
	// 			bidSize: 906,
	// 			lastPrice: 65.5,
	// 			lastSize: 100,
	// 			mark: 65.5,
	// 			quoteTime: 1745304972000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745303815000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 15859003,
	// 			avg1YearVolume: 7623223,
	// 			divAmount: 0,
	// 			divFreq: 0,
	// 			divPayAmount: 0,
	// 			divYield: 0,
	// 			eps: 9.45,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-04-15T00:00:00Z",
	// 			peRatio: 6.05749,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 116,
	// 			"52WeekLow": 37.02,
	// 			askMICId: "ARCX",
	// 			askPrice: 65.4,
	// 			askSize: 2,
	// 			askTime: 1745279896155,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 64.86,
	// 			bidSize: 2,
	// 			bidTime: 1745279896155,
	// 			closePrice: 66.3,
	// 			highPrice: 65.6,
	// 			lastMICId: "XADF",
	// 			lastPrice: 64.86,
	// 			lastSize: 6,
	// 			lowPrice: 63.23,
	// 			mark: 65.3,
	// 			markChange: -1,
	// 			markPercentChange: -1.50829563,
	// 			netChange: -1.44,
	// 			netPercentChange: -2.1719457,
	// 			openPrice: 65.09,
	// 			postMarketChange: -0.44,
	// 			postMarketPercentChange: -0.67381317,
	// 			quoteTime: 1745279896155,
	// 			securityStatus: "Normal",
	// 			totalVolume: 6827625,
	// 			tradeTime: 1745279988263,
	// 		},
	// 		reference: {
	// 			cusip: "910047109",
	// 			description: "UNITED AIRLINES HLDG",
	// 			exchange: "Q",
	// 			exchangeName: "NASDAQ",
	// 			isHardToBorrow: false,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 65.3,
	// 			regularMarketLastSize: 528551,
	// 			regularMarketNetChange: -1,
	// 			regularMarketPercentChange: -1.50829563,
	// 			regularMarketTradeTime: 1745265600003,
	// 		},
	// 	},
	// 	RYAAY: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "ADR",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 32469792,
	// 		symbol: "RYAAY",
	// 		extended: {
	// 			askPrice: 46.66,
	// 			askSize: 1107,
	// 			bidPrice: 43.45,
	// 			bidSize: 1107,
	// 			lastPrice: 37.67,
	// 			lastSize: 75,
	// 			mark: 43.45,
	// 			quoteTime: 1745304960000,
	// 			totalVolume: 0,
	// 			tradeTime: 1744008332000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 1732920,
	// 			avg1YearVolume: 1663225,
	// 			declarationDate: "2024-12-11T00:00:00Z",
	// 			divAmount: 0.94,
	// 			divExDate: "2025-01-17T00:00:00Z",
	// 			divFreq: 2,
	// 			divPayAmount: 0.44344,
	// 			divPayDate: "2025-03-10T00:00:00Z",
	// 			divYield: 2.07,
	// 			eps: 1.80615,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-01-27T00:00:00Z",
	// 			nextDivExDate: "2025-07-17T00:00:00Z",
	// 			nextDivPayDate: "2025-09-10T00:00:00Z",
	// 			peRatio: 29.79875,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 57.476,
	// 			"52WeekLow": 36.956,
	// 			askMICId: "ARCX",
	// 			askPrice: 45,
	// 			askSize: 10,
	// 			askTime: 1745268843672,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 42,
	// 			bidSize: 20,
	// 			bidTime: 1745268843672,
	// 			closePrice: 45.68,
	// 			highPrice: 45.49,
	// 			lastMICId: "XADF",
	// 			lastPrice: 40.8155,
	// 			lastSize: 30,
	// 			lowPrice: 44.51,
	// 			mark: 44.75,
	// 			markChange: -0.93,
	// 			markPercentChange: -2.03590193,
	// 			netChange: -4.8645,
	// 			netPercentChange: -10.64908056,
	// 			openPrice: 45.48,
	// 			postMarketChange: -3.9345,
	// 			postMarketPercentChange: -8.79217877,
	// 			quoteTime: 1745268843672,
	// 			securityStatus: "Normal",
	// 			totalVolume: 628591,
	// 			tradeTime: 1745266687474,
	// 		},
	// 		reference: {
	// 			cusip: "783513203",
	// 			description: "RYANAIR HLDGS PLC ADR",
	// 			exchange: "Q",
	// 			exchangeName: "NASDAQ",
	// 			isHardToBorrow: true,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 44.75,
	// 			regularMarketLastSize: 39730,
	// 			regularMarketNetChange: -0.93,
	// 			regularMarketPercentChange: -2.03590193,
	// 			regularMarketTradeTime: 1745265600007,
	// 		},
	// 	},
	// 	IHG: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "ADR",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 53157932,
	// 		symbol: "IHG",
	// 		extended: {
	// 			askPrice: 104.94,
	// 			askSize: 3,
	// 			bidPrice: 90.3,
	// 			bidSize: 10,
	// 			lastPrice: 105,
	// 			lastSize: 60,
	// 			mark: 104.94,
	// 			quoteTime: 1745304585000,
	// 			totalVolume: 0,
	// 			tradeTime: 1744268727000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 432865,
	// 			avg1YearVolume: 187114,
	// 			declarationDate: "2025-03-13T00:00:00Z",
	// 			divAmount: 2.228,
	// 			divExDate: "2025-04-04T00:00:00Z",
	// 			divFreq: 2,
	// 			divPayAmount: 1.114,
	// 			divPayDate: "2025-05-15T00:00:00Z",
	// 			divYield: 2.19378,
	// 			eps: 3.853,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-02-18T00:00:00Z",
	// 			nextDivExDate: "2025-10-06T00:00:00Z",
	// 			nextDivPayDate: "2025-11-17T00:00:00Z",
	// 			peRatio: 26.35868,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 137.25,
	// 			"52WeekLow": 91.565,
	// 			askMICId: "XNAS",
	// 			askPrice: 149.77,
	// 			askSize: 0,
	// 			askTime: 1745280000163,
	// 			bidMICId: "XNAS",
	// 			bidPrice: 83.4,
	// 			bidSize: 1,
	// 			bidTime: 1745280000033,
	// 			closePrice: 101.56,
	// 			highPrice: 101.22,
	// 			lastMICId: "XADF",
	// 			lastPrice: 100.5,
	// 			lastSize: 12,
	// 			lowPrice: 99.41,
	// 			mark: 100.26,
	// 			markChange: -1.3,
	// 			markPercentChange: -1.28003151,
	// 			netChange: -1.06,
	// 			netPercentChange: -1.043718,
	// 			openPrice: 101.1,
	// 			postMarketChange: 0.24,
	// 			postMarketPercentChange: 0.23937762,
	// 			quoteTime: 1745280000163,
	// 			securityStatus: "Normal",
	// 			totalVolume: 162192,
	// 			tradeTime: 1745277471925,
	// 		},
	// 		reference: {
	// 			cusip: "45857P806",
	// 			description: "INTERCONTINENTAL HOT ADR",
	// 			exchange: "N",
	// 			exchangeName: "NYSE",
	// 			isHardToBorrow: true,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 100.26,
	// 			regularMarketLastSize: 8323,
	// 			regularMarketNetChange: -1.3,
	// 			regularMarketPercentChange: -1.28003151,
	// 			regularMarketTradeTime: 1745276400002,
	// 		},
	// 	},
	// 	HTHT: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "ADR",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 49306196,
	// 		symbol: "HTHT",
	// 		extended: {
	// 			askPrice: 34.75,
	// 			askSize: 2960,
	// 			bidPrice: 34.7,
	// 			bidSize: 2440,
	// 			lastPrice: 34.69,
	// 			lastSize: 40,
	// 			mark: 34.7,
	// 			quoteTime: 1745304996000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745304382000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 3789137,
	// 			avg1YearVolume: 1997810,
	// 			declarationDate: "2025-03-20T00:00:00Z",
	// 			divAmount: 0.97,
	// 			divExDate: "2025-04-09T00:00:00Z",
	// 			divFreq: 2,
	// 			divPayAmount: 0.95,
	// 			divPayDate: "2025-04-30T00:00:00Z",
	// 			divYield: 5.54,
	// 			eps: 1.31525,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-03-20T00:00:00Z",
	// 			nextDivExDate: "2025-10-09T00:00:00Z",
	// 			nextDivPayDate: "2025-10-30T00:00:00Z",
	// 			peRatio: 26.21555,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 42.98,
	// 			"52WeekLow": 27.03,
	// 			askMICId: "ARCX",
	// 			askPrice: 35.25,
	// 			askSize: 10,
	// 			askTime: 1745279750337,
	// 			bidMICId: "XNAS",
	// 			bidPrice: 34.3,
	// 			bidSize: 5,
	// 			bidTime: 1745266957270,
	// 			closePrice: 34.48,
	// 			highPrice: 34.67,
	// 			lastMICId: "XADF",
	// 			lastPrice: 34.45,
	// 			lastSize: 200,
	// 			lowPrice: 33.93,
	// 			mark: 34.45,
	// 			markChange: -0.03,
	// 			markPercentChange: -0.08700696,
	// 			netChange: -0.03,
	// 			netPercentChange: -0.08700696,
	// 			openPrice: 34.43,
	// 			postMarketChange: 0,
	// 			postMarketPercentChange: 0,
	// 			quoteTime: 1745279750337,
	// 			securityStatus: "Normal",
	// 			totalVolume: 1717926,
	// 			tradeTime: 1745268194464,
	// 		},
	// 		reference: {
	// 			cusip: "44332N106",
	// 			description: "H World Group Limite ADR",
	// 			exchange: "Q",
	// 			exchangeName: "NASDAQ",
	// 			isHardToBorrow: true,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 34.45,
	// 			regularMarketLastSize: 53204,
	// 			regularMarketNetChange: -0.03,
	// 			regularMarketPercentChange: -0.08700696,
	// 			regularMarketTradeTime: 1745265600105,
	// 		},
	// 	},
	// 	LUV: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 888983852,
	// 		symbol: "LUV",
	// 		extended: {
	// 			askPrice: 24.49,
	// 			askSize: 2094,
	// 			bidPrice: 24.01,
	// 			bidSize: 100,
	// 			lastPrice: 23.99,
	// 			lastSize: 1465,
	// 			mark: 24.01,
	// 			quoteTime: 1745304378000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745298991000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 16074106,
	// 			avg1YearVolume: 9929171,
	// 			declarationDate: "2025-02-05T00:00:00Z",
	// 			divAmount: 0.72,
	// 			divExDate: "2025-03-12T00:00:00Z",
	// 			divFreq: 4,
	// 			divPayAmount: 0.18,
	// 			divPayDate: "2025-04-02T00:00:00Z",
	// 			divYield: 2.91027,
	// 			eps: 0.75428,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-01-30T00:00:00Z",
	// 			nextDivExDate: "2025-06-12T00:00:00Z",
	// 			nextDivPayDate: "2025-07-02T00:00:00Z",
	// 			peRatio: 32.79949,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 36.12,
	// 			"52WeekLow": 23.58,
	// 			askMICId: "ARCX",
	// 			askPrice: 24.25,
	// 			askSize: 1,
	// 			askTime: 1745280000336,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 24,
	// 			bidSize: 4,
	// 			bidTime: 1745279831130,
	// 			closePrice: 24.74,
	// 			highPrice: 24.72,
	// 			lastMICId: "XADF",
	// 			lastPrice: 24.0693,
	// 			lastSize: 20,
	// 			lowPrice: 23.815,
	// 			mark: 24.04,
	// 			markChange: -0.7,
	// 			markPercentChange: -2.82942603,
	// 			netChange: -0.6707,
	// 			netPercentChange: -2.71099434,
	// 			openPrice: 24.42,
	// 			postMarketChange: 0.0293,
	// 			postMarketPercentChange: 0.1218802,
	// 			quoteTime: 1745280000336,
	// 			securityStatus: "Normal",
	// 			totalVolume: 10956062,
	// 			tradeTime: 1745279949572,
	// 		},
	// 		reference: {
	// 			cusip: "844741108",
	// 			description: "SOUTHWEST AIRLS CO",
	// 			exchange: "N",
	// 			exchangeName: "NYSE",
	// 			isHardToBorrow: false,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 24.04,
	// 			regularMarketLastSize: 2576448,
	// 			regularMarketNetChange: -0.7,
	// 			regularMarketPercentChange: -2.82942603,
	// 			regularMarketTradeTime: 1745276400002,
	// 		},
	// 	},
	// 	NCLH: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 1381386178,
	// 		symbol: "NCLH",
	// 		extended: {
	// 			askPrice: 16.22,
	// 			askSize: 1968,
	// 			bidPrice: 16.08,
	// 			bidSize: 1554,
	// 			lastPrice: 16.18,
	// 			lastSize: 2,
	// 			mark: 16.18,
	// 			quoteTime: 1745304583000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745304535000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 18639561,
	// 			avg1YearVolume: 12720935,
	// 			divAmount: 0,
	// 			divFreq: 0,
	// 			divPayAmount: 0,
	// 			divYield: 0,
	// 			eps: 1.89031,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-02-27T00:00:00Z",
	// 			peRatio: 8.66525,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 29.29,
	// 			"52WeekLow": 14.21,
	// 			askMICId: "ARCX",
	// 			askPrice: 16.24,
	// 			askSize: 1,
	// 			askTime: 1745280000197,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 16.02,
	// 			bidSize: 10,
	// 			bidTime: 1745280000182,
	// 			closePrice: 16.38,
	// 			highPrice: 16.665,
	// 			lastMICId: "XADF",
	// 			lastPrice: 16.11,
	// 			lastSize: 11,
	// 			lowPrice: 15.84,
	// 			mark: 16.05,
	// 			markChange: -0.33,
	// 			markPercentChange: -2.01465201,
	// 			netChange: -0.27,
	// 			netPercentChange: -1.64835165,
	// 			openPrice: 16.3,
	// 			postMarketChange: 0.06,
	// 			postMarketPercentChange: 0.37383178,
	// 			quoteTime: 1745280000197,
	// 			securityStatus: "Normal",
	// 			totalVolume: 12452640,
	// 			tradeTime: 1745279873799,
	// 		},
	// 		reference: {
	// 			cusip: "G66721104",
	// 			description: "NORWEGIAN CRUISE LIN",
	// 			exchange: "N",
	// 			exchangeName: "NYSE",
	// 			isHardToBorrow: true,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 16.05,
	// 			regularMarketLastSize: 1234560,
	// 			regularMarketNetChange: -0.33,
	// 			regularMarketPercentChange: -2.01465201,
	// 			regularMarketTradeTime: 1745276400002,
	// 		},
	// 	},
	// 	AAL: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 1811439071,
	// 		symbol: "AAL",
	// 		extended: {
	// 			askPrice: 9.14,
	// 			askSize: 3109,
	// 			bidPrice: 9.1,
	// 			bidSize: 7027,
	// 			lastPrice: 9.14,
	// 			lastSize: 10,
	// 			mark: 9.14,
	// 			quoteTime: 1745304360000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745304882000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 79051861,
	// 			avg1YearVolume: 38042096,
	// 			declarationDate: "2020-01-22T00:00:00Z",
	// 			divAmount: 0.4,
	// 			divExDate: "2020-02-04T00:00:00Z",
	// 			divFreq: 4,
	// 			divPayAmount: 0.1,
	// 			divPayDate: "2020-02-19T00:00:00Z",
	// 			divYield: 0,
	// 			eps: 1.24359,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-01-23T00:00:00Z",
	// 			nextDivExDate: "2020-05-04T00:00:00Z",
	// 			nextDivPayDate: "2020-05-19T00:00:00Z",
	// 			peRatio: 7.60701,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 19.1,
	// 			"52WeekLow": 8.5,
	// 			askMICId: "XNAS",
	// 			askPrice: 9.08,
	// 			askSize: 48,
	// 			askTime: 1745279995664,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 9.07,
	// 			bidSize: 1,
	// 			bidTime: 1745279995510,
	// 			closePrice: 9.46,
	// 			highPrice: 9.32,
	// 			lastMICId: "XADF",
	// 			lastPrice: 9.08,
	// 			lastSize: 678,
	// 			lowPrice: 8.96,
	// 			mark: 9.07,
	// 			markChange: -0.39,
	// 			markPercentChange: -4.12262156,
	// 			netChange: -0.38,
	// 			netPercentChange: -4.01691332,
	// 			openPrice: 9.3,
	// 			postMarketChange: 0.01,
	// 			postMarketPercentChange: 0.11025358,
	// 			quoteTime: 1745279995664,
	// 			securityStatus: "Normal",
	// 			totalVolume: 60044762,
	// 			tradeTime: 1745279995665,
	// 		},
	// 		reference: {
	// 			cusip: "02376R102",
	// 			description: "AMERICAN AIRLS GROUP",
	// 			exchange: "Q",
	// 			exchangeName: "NASDAQ",
	// 			isHardToBorrow: true,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 9.07,
	// 			regularMarketLastSize: 1596733,
	// 			regularMarketNetChange: -0.39,
	// 			regularMarketPercentChange: -4.12262156,
	// 			regularMarketTradeTime: 1745265600179,
	// 		},
	// 	},
	// 	HST: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 1744449340,
	// 		symbol: "HST",
	// 		extended: {
	// 			askPrice: 14.33,
	// 			askSize: 108,
	// 			bidPrice: 13.18,
	// 			bidSize: 109,
	// 			lastPrice: 13.49,
	// 			lastSize: 6,
	// 			mark: 13.49,
	// 			quoteTime: 1745304818000,
	// 			totalVolume: 0,
	// 			tradeTime: 1744680556000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 14997299,
	// 			avg1YearVolume: 7964684,
	// 			divAmount: 0.8,
	// 			divExDate: "2025-03-31T00:00:00Z",
	// 			divFreq: 4,
	// 			divPayAmount: 0.2,
	// 			divPayDate: "2025-04-15T00:00:00Z",
	// 			divYield: 5.85652,
	// 			eps: 0.99,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-02-19T00:00:00Z",
	// 			nextDivExDate: "2025-06-30T00:00:00Z",
	// 			nextDivPayDate: "2025-07-15T00:00:00Z",
	// 			peRatio: 13.79798,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 19.87,
	// 			"52WeekLow": 12.22,
	// 			askMICId: "EDGX",
	// 			askPrice: 14,
	// 			askSize: 1,
	// 			askTime: 1745275013928,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 13.52,
	// 			bidSize: 1,
	// 			bidTime: 1745278675742,
	// 			closePrice: 13.66,
	// 			highPrice: 13.555,
	// 			lastMICId: "ARCX",
	// 			lastPrice: 13.53,
	// 			lastSize: 11,
	// 			lowPrice: 13.315,
	// 			mark: 13.52,
	// 			markChange: -0.14,
	// 			markPercentChange: -1.02489019,
	// 			netChange: -0.13,
	// 			netPercentChange: -0.95168375,
	// 			openPrice: 13.5,
	// 			postMarketChange: 0.02,
	// 			postMarketPercentChange: 0.14803849,
	// 			quoteTime: 1745278675742,
	// 			securityStatus: "Normal",
	// 			totalVolume: 5324326,
	// 			tradeTime: 1745279577926,
	// 		},
	// 		reference: {
	// 			cusip: "44107P104",
	// 			description: "HOST HOTELS & RESORT",
	// 			exchange: "Q",
	// 			exchangeName: "NASDAQ",
	// 			isHardToBorrow: false,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 13.51,
	// 			regularMarketLastSize: 854981,
	// 			regularMarketNetChange: -0.15,
	// 			regularMarketPercentChange: -1.09809663,
	// 			regularMarketTradeTime: 1745265600314,
	// 		},
	// 	},
	// 	ALK: {
	// 		assetMainType: "EQUITY",
	// 		assetSubType: "COE",
	// 		quoteType: "NBBO",
	// 		realtime: true,
	// 		ssid: 337962442,
	// 		symbol: "ALK",
	// 		extended: {
	// 			askPrice: 56,
	// 			askSize: 113,
	// 			bidPrice: 42.55,
	// 			bidSize: 1101,
	// 			lastPrice: 46.52,
	// 			lastSize: 1,
	// 			mark: 46.52,
	// 			quoteTime: 1745305016000,
	// 			totalVolume: 0,
	// 			tradeTime: 1745217685000,
	// 		},
	// 		fundamental: {
	// 			avg10DaysVolume: 3909456,
	// 			avg1YearVolume: 2590368,
	// 			declarationDate: "2020-01-28T00:00:00Z",
	// 			divAmount: 0,
	// 			divExDate: "2020-02-14T00:00:00Z",
	// 			divFreq: 4,
	// 			divPayAmount: 0.375,
	// 			divPayDate: "2020-03-05T00:00:00Z",
	// 			divYield: 0,
	// 			eps: 3.08,
	// 			fundLeverageFactor: 0,
	// 			lastEarningsDate: "2025-01-22T00:00:00Z",
	// 			nextDivExDate: "2020-05-14T00:00:00Z",
	// 			nextDivPayDate: "2020-06-05T00:00:00Z",
	// 			peRatio: 14.66883,
	// 		},
	// 		quote: {
	// 			"52WeekHigh": 78.08,
	// 			"52WeekLow": 32.621,
	// 			askMICId: "ARCX",
	// 			askPrice: 44.65,
	// 			askSize: 2,
	// 			askTime: 1745265607687,
	// 			bidMICId: "ARCX",
	// 			bidPrice: 42.64,
	// 			bidSize: 1,
	// 			bidTime: 1745280000198,
	// 			closePrice: 45.18,
	// 			highPrice: 44.67,
	// 			lastMICId: "XADF",
	// 			lastPrice: 44.64,
	// 			lastSize: 12,
	// 			lowPrice: 43.22,
	// 			mark: 43.68,
	// 			markChange: -1.5,
	// 			markPercentChange: -3.32005312,
	// 			netChange: -0.54,
	// 			netPercentChange: -1.19521912,
	// 			openPrice: 44.55,
	// 			postMarketChange: 0.96,
	// 			postMarketPercentChange: 2.1978022,
	// 			quoteTime: 1745280000198,
	// 			securityStatus: "Normal",
	// 			totalVolume: 1809216,
	// 			tradeTime: 1745278384539,
	// 		},
	// 		reference: {
	// 			cusip: "011659109",
	// 			description: "ALASKA AIR GROUP INC",
	// 			exchange: "N",
	// 			exchangeName: "NYSE",
	// 			isHardToBorrow: true,
	// 			isShortable: true,
	// 			htbRate: 0,
	// 		},
	// 		regular: {
	// 			regularMarketLastPrice: 43.68,
	// 			regularMarketLastSize: 249936,
	// 			regularMarketNetChange: -1.5,
	// 			regularMarketPercentChange: -3.32005312,
	// 			regularMarketTradeTime: 1745276400004,
	// 		},
	// 	},
	// } as { [symbol: string]: EquityQuote };

	const limit = 200;
	const requests = Math.ceil(tickers.length / limit);
	const token = await getToken();

	const genRequest = async (start: number, end: number) => {
		console.log(`Fetching quotes for: ${tickers.slice(start, end).join(",")}`);
		return axios({
			method: "GET",
			url: "https://api.schwabapi.com/marketdata/v1/quotes",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
			params: {
				symbols: tickers.slice(start, end).join(","),
			},
		});
	};

	const prom = new Array(requests)
		.fill(null)
		.map((_, i) => genRequest(i * limit, (i + 1) * limit));
	return await Promise.all(prom).then((result) =>
		result
			.map((r) => r.data)
			.reduce((acc, curr) => Object.assign(acc, curr), {})
	);
	// .catch(console.error);
}
