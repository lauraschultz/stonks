import { useEffect, useState } from "react";
import TriangleSelect from "./TriangleSelect";
import { Settings as SettingsType } from "./types/Settings";

interface SettingsProps {
	onChange: (settings: Partial<SettingsType>) => void;
	settings: SettingsType;
}

const weightLabels = ["Diversity", "Equity %", "Portfolio %"];

export function Settings({
	onChange,
	settings: { patience, sell, ...weights },
}: SettingsProps) {
	// const [weights, setWeights] = useState<number[]>();
	// const [patient, setPatient] = useState<boolean>(true);
	// const [sell, setSell] = useState<boolean>(false);

	// useEffect(() => {
	// 	if (weights)
	// 		onChange({
	// 			sell,
	// 			patience: patient,
	// 			weightDiversity: weights[0],
	// 			weightDiffQuantity: weights[1],
	// 			weightPortfolioPercent: weights[2],
	// 		});
	// }, [weights, patient, sell]);

	return (
		<div>
			<h3>Settings</h3>
			<label htmlFor="sell">Sell</label>
			<input
				type="checkbox"
				checked={sell}
				name="sell"
				onChange={() => onChange({ sell: !sell })}
			/>
			<TriangleSelect
				labels={weightLabels}
				width={300}
				onSelection={([
					weightDiversity,
					weightDiffQuantity,
					weightPortfolioPercent,
				]) =>
					onChange({
						weightDiversity,
						weightDiffQuantity,
						weightPortfolioPercent,
					})
				}
			/>
			<ul>
				{[
					weights.weightDiversity,
					weights.weightDiffQuantity,
					weights.weightPortfolioPercent,
				]?.map((value, i) => (
					<li key={i}>
						<b>{weightLabels[i]}:</b>
						{`\t\t\t`}
						<span className="mono">{value.toFixed(2)}</span>
					</li>
				))}
			</ul>

			<label htmlFor="patient">Patient</label>
			<input
				type="checkbox"
				checked={patience}
				name="patient"
				onChange={() => onChange({ patience: !patience })}
			/>
		</div>
	);
}
