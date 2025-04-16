import { useState } from "react";
import { Order } from "./types/Order";
import { placeOrders } from "./SchwabApi";

interface PlaceOrdersProps {
	defaultOrders: Order[];
}

export default function PlaceOrders({ defaultOrders }: PlaceOrdersProps) {
	const [orders, setOrders] = useState<Order[]>(defaultOrders);
	const [loading, setLoading] = useState(false);

	const onChange = (symbol: string, newValue: number) => {
		console.log({ symbol, newValue });
		setOrders((current) =>
			current.map((o) => {
				if (o.symbol === symbol) {
					return { ...o, quantity: newValue };
				}
				return o;
			})
		);
	};

	const onReset = () => setOrders(defaultOrders);

	const submit = async () => {
		setLoading(true);
		placeOrders(orders)
			.then(console.log)
			.finally(() => setLoading(false));
	};

	return (
		<>
			<h3>Orders</h3>
			<table>
				<tbody>
					{orders.map(({ instruction, quantity, symbol }) => (
						<tr className="" key={symbol}>
							<td className="font-bold px-2">{symbol.toUpperCase()}</td>
							<td>
								<button
									onClick={() => onChange(symbol, quantity - 1)}
									className="rounded-full h-8 w-8 bg-cyan-800 text-cyan-50 font-black"
								>
									-
								</button>
								<input
									type="text"
									className="border-1 border-gray-400 rounded-sm w-10 px-2 py-1 mx-2 my-1.5"
									onChange={(v) => onChange(symbol, +v.target.value)}
									// defaultValue={quantity * (instruction === "SELL" ? -1 : 1)}
									value={quantity}
								/>
								<button
									onClick={() => onChange(symbol, quantity + 1)}
									className="rounded-full h-8 w-8 bg-cyan-800 text-cyan-50 font-black"
								>
									+
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<button
				className="m-2 rounded-md py-2 px-6 bg-emerald-800 text-emerald-50 font-bold italic"
				onClick={() => submit()}
			>
				Place orders
			</button>
		</>
	);
}
