"use server";

import { PortfolioEtf } from "./types/PortfolioEtf";
import { promises as fs } from "node:fs";
import { EtfHoldings } from "./types/EtfHoldings";

export async function getNoGoList() {
	const file = await fs.readFile(
		process.cwd() + "/app/local/nogo.json",
		"utf8"
	);
	return JSON.parse(file) as string[];
}

export async function getPortfolio() {
	let file;
	try {
		file = await fs.readFile(
			process.cwd() + "/app/local/portfolio.json",
			"utf8"
		);
	} catch (e) {
		return [];
	}

	return JSON.parse(file) as PortfolioEtf[];
}

export async function setPortfolio(portfolio: PortfolioEtf[]) {
	await fs.writeFile(
		process.cwd() + "/app/local/portfolio.json",
		JSON.stringify(portfolio)
	);
}

const etfExpiry = 7 * 44 * 60 * 1000; // 7 days

export async function setEtfCache(etf: string, etfHoldings: EtfHoldings) {
	await fs.writeFile(
		`${process.cwd()}/app/local/cache/${etf.toUpperCase()}.json`,
		JSON.stringify({
			data: etfHoldings,
			expiresAt: new Date().getTime() + etfExpiry,
		})
	);
	// update name on portfolio file, if it exists
	try {
		const file = await fs.readFile(
			process.cwd() + "/app/local/portfolio.json",
			"utf8"
		);
		const updated = (JSON.parse(file) as PortfolioEtf[]).map((e) => {
			if (e.symbol !== etf) return e;
			return { ...e, name: etfHoldings.name };
		});
		await fs.writeFile(
			process.cwd() + "/app/local/portfolio.json",
			JSON.stringify(updated)
		);
	} catch (e) {}
}

export async function getEtfCache(etf: string) {
	try {
		const file = await fs.readFile(
			`${process.cwd()}/app/local/cache/${etf.toUpperCase()}.json`,
			"utf8"
		);
		const parsed = JSON.parse(file);
		if (parsed.expiresAt < new Date().getTime()) return null;
		return parsed.data as EtfHoldings;
	} catch (e) {
		return null;
	}
}
