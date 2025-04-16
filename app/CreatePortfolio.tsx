"use client";

import { useEffect, useState } from "react";
import { getPortfolio, setPortfolio as setPortfolioLocal } from "./local";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { handleCallback } from "./SchwabApi";
import { useSearchParams } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

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

interface CreatePortfolioProps {
	onSave: (portfolio: PortfolioEtf[]) => void;
}

export default function CreatePortfolio({ onSave }: CreatePortfolioProps) {
	const searchParams = useSearchParams();
	const schwabCode = searchParams.get("code");
	const schwabSession = searchParams.get("session");

	useEffect(() => {
		// TODO move this logic to middleware?
		if (schwabCode && schwabSession) handleCallback(schwabCode);
	}, [schwabCode, schwabSession]);

	const [portfolio, setPortfolio] = useState<PortfolioEtf[] | null>(null);
	useEffect(() => {
		getPortfolio().then(setPortfolio);
	}, []);

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

	return (
		<>
			{portfolio ? (
				<>
					<div className="max-w-md">
						<Doughnut data={generateChartData(portfolio)} />
					</div>

					<table className=" rounded-md my-6 shadow-md">
						<thead className="rounded-t-md">
							<tr className="text-lg font-black bg-slate-800 text-slate-50">
								<td className="rounded-tl-md py-2 px-4">ETF</td>
								<td className="py-2 px-4">Percent</td>
								<td className="rounded-tr-md"></td>
							</tr>
						</thead>
						<tbody className="">
							{portfolio?.map((etf, index) => (
								<tr
									key={etf.symbol}
									className={index % 2 === 1 ? "bg-slate-100" : ""}
								>
									<td className="px-4 py-1  ">
										<div className="font-bold">{etf.symbol.toUpperCase()}</div>
										<div className="italic text-sm text-slate-600">
											{etf.name}
										</div>
									</td>
									<td className="px-4 py-1">
										<input
											className="border-1 border-slate-300 w-14 py-2 px-4 rounded-xs bg-white"
											type="text"
											defaultValue={etf.percent}
											onChange={(v) => updateEntry(index, +v.target.value)}
										/>
									</td>
									<td className="px-4">
										<button
											className="px-4 py-2 bg-rose-800 text-rose-50 rounded-md text-xs font-bold"
											onClick={() => removeEntry(index)}
										>
											Remove
										</button>
									</td>
								</tr>
							))}
							<tr>
								<td className="px-4 pt-1 pb-4 rounded-bl-md">
									<label
										htmlFor="ticker"
										className="uppercase text-xs text-slate-500 font-bold block my-1 relative"
									>
										Add new
									</label>
									<input
										className="border-1 border-slate-300 py-2 px-4 rounded-xs bg-white"
										type="text"
										name="ticker"
										value={newTicker}
										onChange={(v) => setNewTicker(v.target.value.toUpperCase())}
									/>
								</td>
								<td className="px-4 py-1">
									<input
										className="border-1 border-slate-300 w-14 py-2 px-4 rounded-xs bg-white"
										type="number"
										name="percent"
										value={newPercent}
										onChange={(v) => setNewPercent(v.target.value)}
									/>
								</td>
								<td className="px-4 py-1 rounded-br-md">
									<button
										className="px-4 py-2 bg-slate-700 text-slate-50 rounded-md font-bold"
										onClick={() => addEntry()}
									>
										Add
									</button>
								</td>
							</tr>
						</tbody>
					</table>
					<button onClick={() => onSave(portfolio)}>Save</button>
				</>
			) : (
				<>Loading...</>
			)}
		</>
	);
}
