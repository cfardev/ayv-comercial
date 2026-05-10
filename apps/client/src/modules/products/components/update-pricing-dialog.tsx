import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product, UpdatePricingPayload } from "../types/api.js";

interface UpdatePricingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product | null;
	onSubmit: (payload: UpdatePricingPayload) => Promise<void>;
	isLoading?: boolean;
	errorMessage?: string | null;
}

function calcMarginPercent(cost: number, price: number): number | null {
	if (cost <= 0) return null;
	return ((price - cost) / cost) * 100;
}

function formatMoney(value: string | number): string {
	const n = Number(value);
	if (Number.isNaN(n)) return String(value);
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
		maximumFractionDigits: 2,
	}).format(n);
}

function MarginBadge({ margin }: { margin: number | null }) {
	if (margin === null) return null;
	const isNegative = margin <= 0;
	return (
		<span
			className={
				isNegative
					? "text-destructive font-semibold"
					: "text-green-600 dark:text-green-400 font-semibold"
			}
		>
			{isNegative ? "" : "+"}
			{margin.toFixed(2)}%
		</span>
	);
}

export function UpdatePricingDialog({
	open,
	onOpenChange,
	product,
	onSubmit,
	isLoading = false,
	errorMessage,
}: UpdatePricingDialogProps) {
	const [costInput, setCostInput] = useState("");
	const [priceInput, setPriceInput] = useState("");
	const [justification, setJustification] = useState("");

	// Warning state: tracks which warnings have been acknowledged
	const [negativeMarginAck, setNegativeMarginAck] = useState(false);
	const [largeVariationAck, setLargeVariationAck] = useState(false);

	// Reset on open/product change
	useEffect(() => {
		if (open && product) {
			setCostInput(product.cost);
			setPriceInput(product.price);
			setJustification("");
			setNegativeMarginAck(false);
			setLargeVariationAck(false);
		}
	}, [open, product]);

	if (!product) return null;

	const prevCost = Number(product.cost);
	const prevPrice = Number(product.price);
	const newCost = Number(costInput);
	const newPrice = Number(priceInput);

	const prevMargin = calcMarginPercent(prevCost, prevPrice);
	const newMargin =
		!Number.isNaN(newCost) && !Number.isNaN(newPrice)
			? calcMarginPercent(newCost, newPrice)
			: null;

	const negativeMarginWarning =
		!Number.isNaN(newCost) &&
		!Number.isNaN(newPrice) &&
		newCost > 0 &&
		newPrice <= newCost;

	const variationPercent =
		prevPrice > 0 && !Number.isNaN(newPrice)
			? Math.abs(((newPrice - prevPrice) / prevPrice) * 100)
			: 0;
	const largeVariationWarning = variationPercent > 50;

	const hasUnsatisfiedWarnings =
		(negativeMarginWarning && !negativeMarginAck) ||
		(largeVariationWarning && !largeVariationAck);

	const inputsValid =
		!Number.isNaN(newCost) &&
		!Number.isNaN(newPrice) &&
		newCost > 0 &&
		newPrice > 0;

	const canSubmit = inputsValid && !hasUnsatisfiedWarnings;

	async function handleSubmit() {
		if (!inputsValid) return;

		const payload: UpdatePricingPayload = {
			cost: newCost,
			salePrice: newPrice,
			justification: justification.trim() || undefined,
			forceNegativeMargin: negativeMarginAck || undefined,
			forceLargeVariation: largeVariationAck || undefined,
		};

		await onSubmit(payload);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Actualizar precios</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Product info */}
					<div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
						<p>
							<span className="text-muted-foreground">Producto: </span>
							<span className="font-medium">{product.name}</span>
						</p>
						<p>
							<span className="text-muted-foreground">Código: </span>
							<span className="font-mono">{product.code}</span>
						</p>
						<div className="flex gap-4 pt-1">
							<p>
								<span className="text-muted-foreground">Costo actual: </span>
								<span>{formatMoney(product.cost)}</span>
							</p>
							<p>
								<span className="text-muted-foreground">Precio actual: </span>
								<span>{formatMoney(product.price)}</span>
							</p>
							<p>
								<span className="text-muted-foreground">Margen: </span>
								<MarginBadge margin={prevMargin} />
							</p>
						</div>
					</div>

					{/* Cost input */}
					<div className="space-y-1.5">
						<Label htmlFor="pricing-cost">Nuevo costo</Label>
						<Input
							id="pricing-cost"
							type="number"
							step="0.01"
							min="0.01"
							placeholder="0.00"
							value={costInput}
							onChange={(e) => {
								setCostInput(e.target.value);
								setNegativeMarginAck(false);
								setLargeVariationAck(false);
							}}
						/>
					</div>

					{/* Sale price input */}
					<div className="space-y-1.5">
						<Label htmlFor="pricing-price">Nuevo precio de venta</Label>
						<Input
							id="pricing-price"
							type="number"
							step="0.01"
							min="0.01"
							placeholder="0.00"
							value={priceInput}
							onChange={(e) => {
								setPriceInput(e.target.value);
								setNegativeMarginAck(false);
								setLargeVariationAck(false);
							}}
						/>
					</div>

					{/* Real-time new margin */}
					{inputsValid && (
						<div className="text-sm">
							<span className="text-muted-foreground">Nuevo margen: </span>
							<MarginBadge margin={newMargin} />
						</div>
					)}

					{/* Negative margin warning */}
					{negativeMarginWarning && (
						<div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm space-y-2">
							<div className="flex items-center gap-2 text-destructive">
								<IconAlertTriangle className="size-4 shrink-0" />
								<span className="font-medium">Margen negativo</span>
							</div>
							<p className="text-muted-foreground">
								El precio de venta es menor o igual al costo. ¿Deseas continuar
								de todas formas?
							</p>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={negativeMarginAck}
									onChange={(e) => setNegativeMarginAck(e.target.checked)}
									className="cursor-pointer"
								/>
								<span>Confirmar margen negativo</span>
							</label>
						</div>
					)}

					{/* Large variation warning */}
					{largeVariationWarning && (
						<div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm space-y-2">
							<div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
								<IconAlertTriangle className="size-4 shrink-0" />
								<span className="font-medium">Variación significativa</span>
							</div>
							<p className="text-muted-foreground">
								El precio varía un{" "}
								<span className="font-semibold">
									{variationPercent.toFixed(1)}%
								</span>{" "}
								respecto al valor anterior (supera el 50%).
							</p>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={largeVariationAck}
									onChange={(e) => setLargeVariationAck(e.target.checked)}
									className="cursor-pointer"
								/>
								<span>Confirmar variación significativa</span>
							</label>
						</div>
					)}

					{/* Justification */}
					<div className="space-y-1.5">
						<Label htmlFor="pricing-justification">
							Justificación{" "}
							<span className="text-muted-foreground">(opcional)</span>
						</Label>
						<Textarea
							id="pricing-justification"
							placeholder="Motivo del cambio de precio..."
							value={justification}
							onChange={(e) => setJustification(e.target.value)}
							rows={2}
							maxLength={500}
						/>
					</div>

					{/* Error */}
					{errorMessage && (
						<p className="text-sm text-destructive">{errorMessage}</p>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						className="cursor-pointer"
						onClick={handleSubmit}
						disabled={!canSubmit || isLoading}
					>
						{isLoading ? "Guardando..." : "Guardar precios"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
