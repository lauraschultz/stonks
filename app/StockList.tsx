import { MouseEventHandler, useEffect, useState } from "react";
import { PortfolioStock } from "./types/PortfolioStock";

interface StockListProps {
	stockList: PortfolioStock[];
}
type Field =
	| "symbol"
	| "quotePrice"
	| "portfolioPercent"
	| "quantityRaw"
	| "diff";

const SortArrow = ({
	state,
	field,
	onClick,
}: {
	state: { field: Field; asc: boolean };
	field: Field;
	onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
	return (
		<button type="button" className="w-8 h-8 bg-amber-200" onClick={onClick}>
			{field === state.field ? (state.asc ? "up" : "down") : ""}
		</button>
	);
};

const getSortFunction = (field: Field, asc: boolean) => {
	let mult = asc ? 1 : -1;
	switch (field) {
		case "symbol":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a.symbol < b.symbol ? 1 : -1) * mult;
		case "quotePrice":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a.quotePrice - b.quotePrice) * mult;
		case "portfolioPercent":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a.portfolioPercent - b.portfolioPercent) * mult;
		case "quantityRaw":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a.quantityRaw - b.quantityRaw) * mult;
		case "diff":
			return (a: PortfolioStock, b: PortfolioStock) => (a.diff - b.diff) * mult;
	}
};

export default function StockList({ stockList }: StockListProps) {
	const [sorted, setSorted] = useState(stockList);
	const [sortedBy, setSortedBy] = useState<{ field: Field; asc: boolean }>({
		field: "diff",
		asc: true,
	});

	const sort = (field: Field, asc: boolean) => {
		console.log(`SORTING`);
		console.log({ field, asc });
		setSorted((current) => current.sort(getSortFunction(field, asc)));
	};

	useEffect(() => sort(sortedBy.field, sortedBy.asc), [sortedBy]);

	const handleClick = (field: Field) => {
		if (sortedBy.field === field) {
			setSortedBy((curr) => ({ ...curr, asc: !curr.asc }));
			return;
		}
		setSortedBy({ field, asc: true });
	};

	return (
		<table>
			<thead>
				<tr>
					<td>
						Stock{" "}
						<SortArrow
							state={sortedBy}
							field="symbol"
							onClick={() => handleClick("symbol")}
						/>
					</td>
					<td>
						Current price &nbsp;
						<SortArrow
							state={sortedBy}
							field="quotePrice"
							onClick={() => handleClick("quotePrice")}
						/>
					</td>
					<td>
						Desired %{" "}
						<SortArrow
							state={sortedBy}
							field="portfolioPercent"
							onClick={() => handleClick("portfolioPercent")}
						/>
					</td>
					<td>
						Quantity
						<SortArrow
							state={sortedBy}
							field="quantityRaw"
							onClick={() => handleClick("quantityRaw")}
						/>
					</td>
					<td>
						Diff
						<SortArrow
							state={sortedBy}
							field="diff"
							onClick={() => handleClick("diff")}
						/>
					</td>
				</tr>
			</thead>
			<tbody>
				{sorted.map((stock) => (
					<tr key={stock.symbol}>
						<td>{stock.symbol}</td>
						<td>{stock.quotePrice.toFixed(2)}</td>
						<td>{stock.portfolioPercent.toFixed(4)}</td>
						<td>{stock.quantityRaw.toFixed(8)}</td>
						<td>{stock.diff.toFixed(8)}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
