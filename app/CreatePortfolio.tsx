"use client";

import { useEffect, useState } from "react";
import { getPortfolio, setPortfolio as setPortfolioLocal } from "./local";
import { PortfolioEtf } from "./types/PortfolioEtf";

export default function CreatePortfolio() {
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
			{ ticker: newTicker, percent: +newPercent },
		]);
		setNewTicker("");
		setNewPercent("");
	};

	const onSave = () => {
		setPortfolioLocal(portfolio || []);
	};

	return (
		<>
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
						<tr key={etf.ticker}>
							<td>{etf.ticker}</td>
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
		</>
	);
}
