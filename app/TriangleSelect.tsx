import { useCallback, useMemo, useState } from "react";

interface TriangleSelectProps {
	onSelection: (value: number[]) => void;
	labels: string[];
	width: number;
}

export default function TriangleSelect({
	width,
	onSelection,
}: TriangleSelectProps) {
	const height = useMemo(
		() => Math.sqrt(Math.pow(width, 2) - Math.pow(width, 2) / 4),
		[width]
	);
	const corners = useMemo(
		() => [
			[0, height],
			[width, height],
			[width / 2, 0],
		],
		[width]
	);

	const [left, setLeft] = useState(width / 2);
	const [top, setTop] = useState(height / 2);

	const updatePointer = useCallback(
		(x: number, y: number) => {
			const boundingRect = document
				.getElementById("tri")
				?.getBoundingClientRect();
			if (!boundingRect) return;
			const top = y - boundingRect.y;
			const left = x - boundingRect.x;
			// validate that position is inside triangle

			setLeft(left);
			setTop(top);

			const distances = corners.map(([xPos, yPos]) => {
				return 1 - Math.hypot(xPos - left, yPos - top) / width;
			});

			onSelection(distances);
		},
		[setLeft, setTop]
	);

	return (
		<div
			className="relative"
			style={{ width: `${width}px`, height: `${height}px` }}
		>
			<div
				className={`absolute w-4 h-4 shadow-md bg-slate-800 rounded-full border-2 border-slate-50 cursor-grab -ml-2 -mb-2`}
				style={{ left: `${left}px`, top: `${top}px` }}
			></div>
			<svg
				height="100%"
				width="100%"
				id="tri"
				onClick={(e) => {
					updatePointer(e.clientX, e.clientY);
				}}
			>
				<path
					d={`M${corners.map(([a, b]) => `${a} ${b}`).join(" L")} Z`}
					fill="oklch(89.4% .057 293.283)"
				/>
			</svg>
		</div>
	);
}
