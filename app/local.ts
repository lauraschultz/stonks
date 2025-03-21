"use server";

import { PortfolioEtf } from "./types/PortfolioEtf";
import { Stock } from "./types/Stock";
import { promises as fs } from "node:fs";

export async function getNoGoList() {
	const file = await fs.readFile(
		process.cwd() + "/app/local/nogo.json",
		"utf8"
	);
	console.log({ file });
}

export async function getPortfolio() {
	const file = await fs.readFile(
		process.cwd() + "/app/local/portfolio.json",
		"utf8"
	);

	return JSON.parse(file) as PortfolioEtf[];
}

// make this a form action? NO!
export async function setPortfolio(portfolio: PortfolioEtf[]) {
	await fs.writeFile(
		process.cwd() + "/app/local/portfolio.json",
		JSON.stringify(portfolio)
	);
}
