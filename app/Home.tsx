"use client";

import { useCallback, useState } from "react";
import CreatePortfolio from "./CreatePortfolio";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { setPortfolio as setPortfolioLocal } from "./local";
import { PortfolioStock } from "./types/PortfolioStock";
import { Order } from "./types/Order";
import { buildOrderListV1, etfToStock } from "./algos";
import PlaceOrders from "./PlaceOrders";
import StockList from "./StockList";

export default function Home() {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [stockList, setStockList] = useState<PortfolioStock[] | null>(null);
	const [orders, setOrders] = useState<Order[] | null>(null);

	const onSavePortfolio = useCallback((portfolio: PortfolioEtf[]) => {
		setPortfolioLocal(portfolio);

		setIsGenerating(true);
		setStockList(null);
		setOrders(null);
		etfToStock(portfolio)
			.then((result) => {
				const stocks = result.values().toArray();
				setStockList(stocks);
				buildOrderListV1(stocks).then((result) => setOrders(result));
			})
			.catch(console.error)
			.finally(() => setIsGenerating(false));
	}, []);

	return (
		<>
			<div className="mx-auto my-10 p-8">
				<CreatePortfolio onSave={onSavePortfolio} />
			</div>

			{isGenerating ? <div>Generating stock portfolio...</div> : <></>}

			{stockList ? <StockList stockList={stockList} /> : <></>}

			{orders ? <PlaceOrders defaultOrders={orders} /> : <></>}
		</>
	);
}
