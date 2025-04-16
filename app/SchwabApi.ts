"use server";

import axios, { AxiosResponse } from "axios";
import { promises as fs } from "node:fs";
import { Order } from "./types/Order";

// returns valid access token
export async function getToken(): Promise<string> {
	// check for valid auth token
	let accessTokenJson;
	try {
		accessTokenJson = await fs.readFile(
			process.cwd() + "/app/tokens/access.json",
			"utf8"
		);
	} catch (e) {
		// no file, login
		console.log("no file found, init login");
		loginInit();
		return "";
	}
	const accessToken = JSON.parse(accessTokenJson || "");
	if (accessToken?.expiresAt > new Date().getTime()) {
		return accessToken.token;
	}

	// access token expired, try to refresh
	console.log("token expired, refreshing");
	const refreshToken = await refresh();
	return refreshToken;
}

export async function loginInit() {
	console.log(
		`https://api.schwabapi.com/v1/oauth/authorize?client_id=${process.env.SCHWAB_APP_KEY}&redirect_uri=https://127.0.0.1:3000`
	);
}

export async function handleCallback(code: string) {
	const base64Credentials = Buffer.from(
		`${process.env.SCHWAB_APP_KEY}:${process.env.SCHWAB_APP_SECRET}`
	).toString("base64");

	try {
		const response = await axios({
			method: "POST",
			url: "https://api.schwabapi.com/v1/oauth/token",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${base64Credentials}`,
			},
			data: `grant_type=authorization_code&code=${code}&redirect_uri=${"https://127.0.0.1:3000"}`,
		});

		// save access and refresh token
		fs.writeFile(
			process.cwd() + "/app/tokens/access.json",
			JSON.stringify({
				expiresAt: new Date().getTime() + response.data.expires_in * 1000,
				token: response.data.access_token,
			})
		);
		fs.writeFile(
			process.cwd() + "/app/tokens/refresh.json",
			JSON.stringify({
				token: response.data.refresh_token,
			})
		);
	} catch (e) {
		console.error(e);
	}
}

export async function refresh(): Promise<string> {
	const base64Credentials = Buffer.from(
		`${process.env.SCHWAB_APP_KEY}:${process.env.SCHWAB_APP_SECRET}`
	).toString("base64");
	let refreshTokenJson;
	try {
		refreshTokenJson = await fs.readFile(
			process.cwd() + "/app/tokens/refresh.json",
			"utf8"
		);
	} catch (e) {
		console.error(e);
		loginInit();
	}
	const refreshToken = JSON.parse(refreshTokenJson || "");
	let response;
	try {
		response = await axios({
			method: "POST",
			url: "https://api.schwabapi.com/v1/oauth/token",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${base64Credentials}`,
			},
			data: `grant_type=refresh_token&refresh_token=${refreshToken?.token}`,
		});
	} catch (e) {
		console.error(e);
		loginInit();
	}

	// save access and refresh token
	await fs.writeFile(
		process.cwd() + "/app/tokens/access.json",
		JSON.stringify({
			expiresAt: new Date().getTime() + response!.data.expires_in * 1000,
			token: response!.data.access_token,
		})
	);

	return response!.data.access_token;
}

export async function getUserPortfolio() {
	const token = await getToken();
	console.log({ token });

	/**
   * [
    {
        "securitiesAccount": {
            "type": "MARGIN",
            "accountNumber": "********",
            "roundTrips": 0,
            "isDayTrader": false,
            "isClosingOnlyRestricted": false,
            "pfcbFlag": false,
            "positions": [
                {
                    "shortQuantity": 0,
                    "averagePrice": 113.53,
                    "currentDayProfitLoss": -7.04,
                    "currentDayProfitLossPercentage": -1.58,
                    "longQuantity": 4,
                    "settledLongQuantity": 4,
                    "settledShortQuantity": 0,
                    "instrument": {
                        "assetType": "EQUITY",
                        "cusip": "67066G104",
                        "symbol": "NVDA",
                        "netChange": -2.4199
                    },
                    "marketValue": 438.68,
                    "maintenanceRequirement": 131.6,
                    "averageLongPrice": 113.53,
                    "taxLotAverageLongPrice": 113.53,
                    "longOpenProfitLoss": -15.44,
                    "previousSessionLongQuantity": 4,
                    "currentDayCost": 0
                },
                {
                    "shortQuantity": 0,
                    "averagePrice": 572.32,
                    "currentDayProfitLoss": -29.2,
                    "currentDayProfitLossPercentage": -1.29,
                    "longQuantity": 4,
                    "settledLongQuantity": 4,
                    "settledShortQuantity": 0,
                    "instrument": {
                        "assetType": "EQUITY",
                        "cusip": "55354G100",
                        "symbol": "MSCI",
                        "netChange": -10.76
                    },
                    "marketValue": 2233.88,
                    "maintenanceRequirement": 670.16,
                    "averageLongPrice": 572.32,
                    "taxLotAverageLongPrice": 572.32,
                    "longOpenProfitLoss": -55.4,
                    "previousSessionLongQuantity": 4,
                    "currentDayCost": 0
                }
            ],
            "initialBalances": {
                "accruedInterest": 0,
                "availableFundsNonMarginableTrade": 14039.8,
                "bondValue": 59028,
                "buyingPower": 29514,
                "cashBalance": 13367.24,
                "cashAvailableForTrading": 0,
                "cashReceipts": 0,
                "dayTradingBuyingPower": 61487,
                "dayTradingBuyingPowerCall": 0,
                "dayTradingEquityCall": 0,
                "equity": 16039.8,
                "equityPercentage": 100,
                "liquidationValue": 16039.8,
                "longMarginValue": 2672.56,
                "longOptionMarketValue": 0,
                "longStockValue": 2672.56,
                "maintenanceCall": 0,
                "maintenanceRequirement": 802,
                "margin": 13367.24,
                "marginEquity": 16039.8,
                "moneyMarketFund": 0,
                "mutualFundValue": 14039.8,
                "regTCall": 0,
                "shortMarginValue": 0,
                "shortOptionMarketValue": 0,
                "shortStockValue": 0,
                "totalCash": 0,
                "isInCall": false,
                "pendingDeposits": 0,
                "marginBalance": 0,
                "shortBalance": 0,
                "accountValue": 16039.8
            },
            "currentBalances": {
                "accruedInterest": 0,
                "cashBalance": 13367.24, // uninvested cash
                "cashReceipts": 0,
                "longOptionMarketValue": 0,
                "liquidationValue": 16039.8,
                "longMarketValue": 2672.56,
                "moneyMarketFund": 0,
                "savings": 0,
                "shortMarketValue": 0,
                "pendingDeposits": 0,
                "mutualFundValue": 0,
                "bondValue": 0,
                "shortOptionMarketValue": 0,
                "availableFunds": 14757,
                "availableFundsNonMarginableTrade": 14757,
                "buyingPower": 29514,
                "buyingPowerNonMarginableTrade": 14757,
                "dayTradingBuyingPower": 61487,
                "equity": 16039.8,
                "equityPercentage": 100,
                "longMarginValue": 2672.56,
                "maintenanceCall": 0,
                "maintenanceRequirement": 801.76,
                "marginBalance": 0,
                "regTCall": 0,
                "shortBalance": 0,
                "shortMarginValue": 0,
                "sma": 14757
            },
            "projectedBalances": {
                "availableFunds": 14757,
                "availableFundsNonMarginableTrade": 14757,
                "buyingPower": 29514,
                "dayTradingBuyingPower": 61487,
                "dayTradingBuyingPowerCall": 0,
                "maintenanceCall": 0,
                "regTCall": 0,
                "isInCall": false,
                "stockBuyingPower": 29514
            }
        },
        "aggregatedBalance": {
            "currentLiquidationValue": 16039.8,
            "liquidationValue": 16039.8
        }
    }
]
   */

	try {
		const res = await axios({
			method: "GET",
			url: "https://api.schwabapi.com/trader/v1/accounts?fields=positions",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
			},
		});
		console.log(res.data[0].securitiesAccount.positions);
		return res.data[0];
	} catch (e) {
		console.error(e);
	}
}

async function getAccountHash() {
	const token = await getToken();

	return await axios({
		method: "GET",
		url: "https://api.schwabapi.com/trader/v1/accounts/accountNumbers",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	})
		.then((res) => {
			console.log(res.data);
			return res.data[0].hashValue;
		})
		.catch(console.error);
}

export async function placeOrders(orders: Order[]) {
	const accountHash = await getAccountHash();
	const token = await getToken();
	const buildRequest = ({ symbol, instruction, quantity }: Order) =>
		axios({
			method: "POST",
			url: `https://api.schwabapi.com/trader/v1/accounts/${accountHash}/orders`,
			data: {
				// "price": null,
				session: "NORMAL",
				duration: "DAY",
				orderType: "MARKET",
				// complexOrderStrategyType: "NONE",
				// quantity: orders.length,
				// taxLotMethod: "FIFO",
				orderLegCollection: [
					{
						// orderLegType: order_leg_type,
						// legId: leg_id,
						instrument: {
							symbol,
							assetType: "EQUITY",
						},
						instruction,
						// positionEffect: "OPENING",
						quantity,
					},
				],
				orderStrategyType: "SINGLE",
			},
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
			},
		});

	return Promise.all(
		orders.filter(({ quantity }) => quantity !== 0).map(buildRequest)
	)
		.then((res) => {
			console.log({ res });
			// return res.data[0].hashValue;
		})
		.catch((e) => console.error(e.response?.data?.errors));
}
