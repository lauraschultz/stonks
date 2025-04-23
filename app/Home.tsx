"use client";

import { useCallback, useEffect, useState } from "react";
import CreatePortfolio from "./CreatePortfolio";
import { PortfolioEtf } from "./types/PortfolioEtf";
import { setPortfolio as setPortfolioLocal } from "./local";
import { PortfolioStock } from "./types/PortfolioStock";
import { Order } from "./types/Order";
import { buildOrderListV1, etfToStock } from "./algos";
import PlaceOrders from "./PlaceOrders";
import StockList from "./StockList";
import { SchwabUserPortfolio } from "./types/SchwabUserPortfolio";
import { getUserPortfolio } from "./SchwabApi";

export default function Home() {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [stockList, setStockList] = useState<PortfolioStock[] | null>(null);
	const [orders, setOrders] = useState<Order[] | null>(null);
	const [userPortfolio, setUserPortfolio] = useState<SchwabUserPortfolio>();

	useEffect(() => {
		getUserPortfolio().then((result) => setUserPortfolio(result));
	}, []);

	const onSavePortfolio = useCallback((portfolio: PortfolioEtf[]) => {
		const sorted = [...portfolio].sort((a, b) => b.percent - a.percent);
		setPortfolioLocal(sorted);

		setIsGenerating(true);
		setStockList(null);
		setOrders(null);
		etfToStock(sorted)
			.then((stocks) => {
				setStockList(stocks);
				buildOrderListV1(stocks, userPortfolio!).then((result) =>
					setOrders(result)
				);
			})
			.catch(console.error)
			.finally(() => setIsGenerating(false));
	}, []);

	return (
		<>
			<div className="mx-auto my-10 p-8 w-[max-content]">
				<CreatePortfolio onSave={onSavePortfolio} />
			</div>

			<p className="my-4 text-lg italic">
				Current portfolio value is $
				<span className="font-bold">
					{userPortfolio?.securitiesAccount.currentBalances.equity}
				</span>
				, of which $
				<span className="font-bold">
					{userPortfolio?.securitiesAccount.currentBalances.cashBalance}
				</span>{" "}
				is uninvested cash.
			</p>

			{isGenerating ? <div>Generating stock portfolio...</div> : <></>}

			{stockList ? <StockList stockList={stockList} /> : <></>}

			{orders ? <PlaceOrders defaultOrders={orders} /> : <></>}
		</>
	);
}
