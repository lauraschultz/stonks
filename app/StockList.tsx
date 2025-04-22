import { MouseEventHandler, useEffect, useState } from "react";
import { PortfolioStock } from "./types/PortfolioStock";

interface StockListProps {
	stockList: PortfolioStock[];
}
type Field =
	| "symbol"
	| "quotePrice"
	| "portfolioPercent"
	| "diff"
	| "diffPercent"
	| "currentQuantity";

const SortArrow = ({
	state,
	field,
}: // onClick,
{
	state: { field: Field; asc: boolean };
	field: Field;
	// onClick: MouseEventHandler<HTMLButtonElement>;
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
		case "quotePrice":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(b.quotePrice - a.quotePrice) * mult;
		case "portfolioPercent":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(b.portfolioPercent - a.portfolioPercent) * mult;
		case "currentQuantity":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(b.currentQuantity - a.currentQuantity) * mult;
		case "diff":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(b.diffQuantity - a.diffQuantity) * mult;
		case "diffPercent":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(b.diffPercent - a.diffPercent) * mult;
	}
};

export default function StockList({ stockList }: StockListProps) {
	const [sorted, setSorted] = useState(stockList);
	const [sortedBy, setSortedBy] = useState<{ field: Field; asc: boolean }>({
		field: "diff",
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
						onClick={() => handleClick("diffPercent")}
					>
						Diff % (raw)
						<SortArrow state={sortedBy} field="diffPercent" />
					</td>
					<td
						className="cursor-pointer py-2 px-4"
						onClick={() => handleClick("diff")}
					>
						Diff
						<SortArrow state={sortedBy} field="diff" />
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
							{stock.portfolioPercent.toFixed(2)}
						</td>
						<td className="py-1 px-4 font-mono">
							{stock.diffPercent.toFixed(2)}
						</td>
						<td className="py-1 px-4">{stock.diffQuantity}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
