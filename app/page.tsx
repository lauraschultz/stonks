import CreatePortfolio from "./CreatePortfolio";
import EtfSearch from "./EtfSearch";
import getEtfHoldings from "./getEtfHoldings";

export default function Home() {
	return (
		<>
			<EtfSearch />
			<CreatePortfolio />
		</>
	);
}
