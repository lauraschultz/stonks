import { useEffect, useState } from "react";
import { PortfolioStock } from "./types/PortfolioStock";

interface StockListProps {
	stockList: PortfolioStock[];
}
type Field = keyof PortfolioStock;

const SortArrow = ({
	state,
	field,
}: {
	state: { field: Field; asc: boolean };
	field: Field;
}) => {
	return (
		<button type="button" className="ml-2 w-3">
			{field === state.field ? state.asc ? <>▲</> : <>▼</> : ""}
		</button>
	);
};

const getSortFunction = (field: Field, asc: boolean) => {
	let mult = asc ? 1 : -1;
	switch (field) {
		case "symbol":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a.symbol < b.symbol ? -1 : 1) * mult;
		default:
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a[field] < b[field] ? 1 : -1) * mult;
	}
};

export default function StockList({ stockList }: StockListProps) {
	const [sorted, setSorted] = useState(stockList);
	const [sortedBy, setSortedBy] = useState<{ field: Field; asc: boolean }>({
		field: "diffQuantityNormal",
		asc: true,
	});

	const sort = (field: Field, asc: boolean) => {
		setSorted((current) => [...current].sort(getSortFunction(field, asc)));
	};

	useEffect(() => {
		sort(sortedBy.field, sortedBy.asc);
	}, [sortedBy]);

	const handleClick = (newField: Field) => {
		setSortedBy(({ field, asc }) => {
			if (field === newField) {
				return { field, asc: !asc };
			}
			return { field: newField, asc: true };
		});
	};

	return (
		<table className="my-6 shadow-md">
			<thead>
				<tr className="text-md font-black">
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("symbol")}
					>
						Stock
						<SortArrow state={sortedBy} field="symbol" />
					</td>
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("quotePrice")}
					>
						Current price
						<SortArrow state={sortedBy} field="quotePrice" />
					</td>
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("currentQuantity")}
					>
						Current quantity
						<SortArrow state={sortedBy} field="currentQuantity" />
					</td>
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("portfolioPercent")}
					>
						Desired %
						<SortArrow state={sortedBy} field="portfolioPercent" />
					</td>
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("diffPercentNormal")}
					>
						Diff % (normalized)
						<SortArrow state={sortedBy} field="diffPercentNormal" />
					</td>
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("diffQuantityNormal")}
					>
						Diff (count)
						<SortArrow state={sortedBy} field="diffQuantityNormal" />
					</td>
				</tr>
			</thead>
			<tbody>
				{sorted.map((stock, i) => (
					<tr key={stock.symbol} className={i % 2 === 0 ? "bg-slate-100" : ""}>
						<td className="py-1 px-4">{stock.symbol}</td>
						<td className="py-1 px-4">${stock.quotePrice.toFixed(2)}</td>
						<td className="py-1 px-4">{stock.currentQuantity}</td>
						<td className="py-1 px-4 font-mono">
							{stock.portfolioPercent.toFixed(4)}
						</td>
						<td className="py-1 px-4 font-mono">
							{stock.diffPercentNormal.toFixed(4)}
						</td>
						<td className="py-1 px-4 font-mono">
							{stock.diffQuantityNormal.toFixed(4)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
