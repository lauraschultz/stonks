import { useCallback, useEffect, useState } from "react";
import { PortfolioStock } from "./types/PortfolioStock";
import { Order } from "./types/Order";
import { placeOrders } from "./SchwabApi";

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

const displayQuantity = (order: Order | undefined): number => {
	if (!order) return 0;
	return order.quantity * (order.instruction === "SELL" ? -1 : 1);
};

const getSortFunction = (
	field: Field,
	asc: boolean,
	orders: Map<string, Order>
) => {
	let mult = asc ? 1 : -1;
	switch (field) {
		case "symbol":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a.symbol < b.symbol ? -1 : 1) * mult;
		case "orderQuantity":
			return (a: PortfolioStock, b: PortfolioStock) =>
				(displayQuantity(orders.get(b.symbol)) -
					displayQuantity(orders.get(a.symbol))) *
				mult;
		default:
			return (a: PortfolioStock, b: PortfolioStock) =>
				(a[field] < b[field] ? 1 : -1) * mult;
	}
};

const generateDefaultOrders = (
	stockList: PortfolioStock[]
): Map<string, Order> => {
	return stockList.reduce((acc, { symbol, orderQuantity }) => {
		acc.set(symbol, {
			symbol,
			quantity: orderQuantity < 0 ? orderQuantity * -1 : orderQuantity,
			instruction: orderQuantity < 0 ? "SELL" : "BUY",
		});
		return acc;
	}, new Map<string, Order>());
};

export default function StockList({ stockList }: StockListProps) {
	const [sorted, setSorted] = useState(stockList);
	const [sortedBy, setSortedBy] = useState<{ field: Field; asc: boolean }>({
		field: "orderQuantity",
		asc: true,
	});
	const [orders, setOrders] = useState<Map<string, Order>>(
		generateDefaultOrders(stockList)
	);
	const [showResetButton, setShowResetButton] = useState(false);

	const sort = (field: Field, asc: boolean) => {
		setSorted((current) =>
			[...current].sort(getSortFunction(field, asc, orders))
		);
	};

	const onResetOrders = useCallback(() => {
		setOrders(generateDefaultOrders(stockList));
		setShowResetButton(false);
	}, [setOrders, setShowResetButton]);

	const onChangeOrderQuantity = useCallback(
		(symbol: string, newValue: number) => {
			setShowResetButton(true);
			setOrders((current) => ({
				...current,
				[symbol]: {
					symbol,
					instruction: newValue < 0 ? "SELL" : "BUY",
					quantity: newValue < 0 ? newValue * -1 : newValue,
				},
			}));
		},
		[setOrders, setShowResetButton]
	);

	const submit = async () => {
		// setLoading(true);
		placeOrders(
			orders
				.values()
				.toArray()
				.filter(({ quantity }) => quantity !== 0)
		).then(console.log);
		// .finally(() => setLoading(false));
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
		<>
			<div className="h-16 flex justify-end px-8">
				{showResetButton ? (
					<button
						className="bg-slate-600 text-slate-50 font-bold italic py-2 px-4 my-2 rounded-md"
						type="button"
						onClick={onResetOrders}
					>
						Reset orders
					</button>
				) : (
					<></>
				)}
			</div>

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
						<td
							className="cursor-pointer py-2 px-4"
							onClick={() => handleClick("orderQuantity")}
						>
							Order quantity
							<SortArrow state={sortedBy} field="orderQuantity" />
						</td>
					</tr>
				</thead>
				<tbody>
					{sorted.map(
						(
							{
								symbol,
								quotePrice,
								currentQuantity,
								portfolioPercent,
								diffPercentNormal,
								diffQuantityNormal,
							},
							i
						) => (
							<tr key={symbol} className={i % 2 === 0 ? "bg-slate-100" : ""}>
								<td className="py-1 px-4">{symbol}</td>
								<td className="py-1 px-4">${quotePrice.toFixed(2)}</td>
								<td className="py-1 px-4">{currentQuantity}</td>
								<td className="py-1 px-4 font-mono">
									{portfolioPercent.toFixed(4)}
								</td>
								<td className="py-1 px-4 font-mono">
									{diffPercentNormal.toFixed(4)}
								</td>
								<td className="py-1 px-4 font-mono">
									{diffQuantityNormal.toFixed(4)}
								</td>
								<td className="py-1 px-4">
									<button
										onClick={() =>
											onChangeOrderQuantity(
												symbol,
												displayQuantity(orders.get(symbol)) - 1
											)
										}
										className="rounded-full h-6 w-6 bg-cyan-800 text-cyan-50 font-black text-xs"
									>
										-
									</button>
									<input
										type="text"
										className="border-1 border-gray-400 rounded-sm w-10 px-1.5 py-0.5 mx-1.5 my-1 bg-white shadow-xs"
										onChange={(v) =>
											onChangeOrderQuantity(symbol, +v.target.value)
										}
										value={displayQuantity(orders.get(symbol))}
									/>
									<button
										onClick={() =>
											onChangeOrderQuantity(
												symbol,
												displayQuantity(orders.get(symbol)) + 1
											)
										}
										className="rounded-full h-6 w-6 bg-cyan-800 text-cyan-50 font-black text-xs"
									>
										+
									</button>
								</td>
							</tr>
						)
					)}
				</tbody>
			</table>
			<button
				className="m-2 rounded-md py-2 px-6 bg-emerald-800 text-emerald-50 font-bold italic mb-8"
				onClick={() => submit()}
			>
				Place orders
			</button>
		</>
	);
}
