"use server";

import axios, { AxiosResponse } from "axios";
import { promises as fs } from "node:fs";
import { Order } from "./types/Order";
import { SchwabUserPortfolio } from "./types/SchwabUserPortfolio";

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

export async function getUserPortfolio(): Promise<SchwabUserPortfolio> {
	const token = await getToken();
	console.log({ token });

	const res = await axios({
		method: "GET",
		url: "https://api.schwabapi.com/trader/v1/accounts?fields=positions",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	});
	return res.data[0];
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
