"use client";

import { useEffect, useState } from "react";
import { getPortfolio, setPortfolio as setPortfolioLocal } from "./local";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { handleCallback } from "./SchwabApi";
import { useSearchParams } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { etfToStock } from "./algos";
import { PortfolioStock } from "./types/PortfolioStock";

ChartJS.register(ArcElement, Tooltip, Legend);

const generateChartData = (portfolio: PortfolioEtf[]) => {
	const colors = ["#e92626", "	#f6db35", "#4bd64b", "#445edd", "#8c1d8c"];
	const totalInvested = portfolio.reduce((acc, curr) => curr.percent + acc, 0);

	return {
		labels: [...portfolio?.map((etf) => etf.symbol), "Uninvested"],
		datasets: [
			{
				data: [...portfolio?.map((etf) => etf.percent), 100 - totalInvested],
				backgroundColor: [
					...Array(portfolio.length)
						.fill("")
						.map((_, i) => colors[i % colors.length]),
					"#808080",
				],
			},
		],
	};
};

export default function CreatePortfolio() {
	const searchParams = useSearchParams();
	const schwabCode = searchParams.get("code");
	const schwabSession = searchParams.get("session");

	useEffect(() => {
		// TODO move this logic to middleware?
		if (schwabCode && schwabSession) handleCallback(schwabCode);
	}, [schwabCode, schwabSession]);

	const [portfolio, setPortfolio] = useState<PortfolioEtf[]>([]);
	useEffect(() => {
		getPortfolio().then(setPortfolio);
	}, []);

	const [stockList, setStockList] = useState<PortfolioStock[]>();
	const [generating, setGenerating] = useState(false);

	const [newTicker, setNewTicker] = useState<string>("");
	const [newPercent, setNewPercent] = useState<string>("");

	const removeEntry = (index: number) => {
		setPortfolio((current) => current!.filter((_, i) => i !== index));
	};

	const updateEntry = (index: number, percent: number) => {
		setPortfolio((current) =>
			current!.map((value, i) => {
				if (i === index) value.percent = percent;
				return value;
			})
		);
	};

	const addEntry = () => {
		if (!portfolio) return;
		setPortfolio((current) => [
			...current!,
			{ symbol: newTicker, percent: +newPercent },
		]);
		setNewTicker("");
		setNewPercent("");
	};

	const onSave = () => {
		setPortfolioLocal(portfolio);

		setGenerating(true);
		etfToStock(portfolio)
			.then((result) => {
				const stocks = result.values().toArray();
				setStockList(stocks);
			})
			.catch(console.error)
			.finally(() => setGenerating(false));
	};

	return (
		<>
			<div className="max-w-md">
				<Doughnut data={generateChartData(portfolio)} />
			</div>

			<table>
				<thead>
					<tr>
						<td>ETF</td>
						<td>Percent</td>
						<td></td>
					</tr>
				</thead>
				<tbody>
					{portfolio?.map((etf, index) => (
						<tr key={etf.symbol}>
							<td>{etf.symbol}</td>
							<td>
								<input
									type="number"
									defaultValue={etf.percent}
									onChange={(v) => updateEntry(index, +v.target.value)}
								/>
							</td>
							<td>
								<button onClick={() => removeEntry(index)}>Remove</button>
							</td>
						</tr>
					))}
					<tr>
						<td>
							<input
								type="text"
								name="ticker"
								value={newTicker}
								onChange={(v) => setNewTicker(v.target.value)}
							/>
						</td>
						<td>
							<input
								type="number"
								name="percent"
								value={newPercent}
								onChange={(v) => setNewPercent(v.target.value)}
							/>
						</td>
						<td>
							<button onClick={() => addEntry()}>Add</button>
						</td>
					</tr>
				</tbody>
			</table>
			<button onClick={() => onSave()}>Save</button>

			{generating ? <div>Generating stock portfolio...</div> : <></>}

			{stockList ? (
				<table>
					<thead>
						<tr>
							<td>Stock</td>
							<td>Current price</td>
							<td>Desired %</td>
							<td>Quantity</td>
							<td>Diff</td>
						</tr>
					</thead>
					<tbody>
						{stockList.map((stock) => (
							<tr key={stock.symbol}>
								<td>{stock.symbol}</td>
								<td>{stock.quotePrice}</td>
								<td>{stock.portfolioPercent}</td>
								<td>{stock.quantityRaw}</td>
								<td>{stock.diff}</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<></>
			)}
		</>
	);
}
