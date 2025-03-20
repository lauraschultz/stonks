"use client";
import { useActionState, useState } from "react";
import getEtfHoldings, { EtfHoldings } from "./getEtfHoldings";

export default function EtfSearch() {
	const [state, action, loading] = useActionState(getEtfHoldings, null);

	return (
		<>
			<form action={action}>
				<label htmlFor="etf">EFT Symbol:</label>
				<input type="text" name="etf" />
			</form>
			{loading ? <p>Loading...</p> : <></>}

			{state ? (
				<>
					<h2>Stock holdings for {state.ticker}</h2>

					<table>
						<thead>
							<tr>
								<td>Symbol</td>
								<td>Name</td>
								<td>Percent</td>
							</tr>
						</thead>
						<tbody>
							{state?.holdings.map((stock) => (
								<tr key={`${stock.ticker}${stock.name}`}>
									<td>{stock.ticker}</td>
									<td>{stock.name}</td>
									<td>{stock.percent}</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			) : (
				<></>
			)}
		</>
	);
}
