import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/hooks/use-pagination-state";

interface DataTablePaginationProps {
	page: number;
	totalPages: number;
	total: number;
	pageSize: PageSize;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: PageSize) => void;
	/** e.g. "cliente", "producto" — used in the total label */
	itemLabel?: string;
}

export function DataTablePagination({
	page,
	totalPages,
	total,
	pageSize,
	onPageChange,
	onPageSizeChange,
	itemLabel = "registro",
}: DataTablePaginationProps) {
	const safeTotalPages = Math.max(1, totalPages);
	const plural = total !== 1 ? "s" : "";

	return (
		<div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm text-muted-foreground">
				{total} {itemLabel}
				{plural} en total
			</p>

			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2 text-sm">
					<span className="text-muted-foreground whitespace-nowrap">
						Filas por página
					</span>
					<Select
						value={String(pageSize)}
						onValueChange={(value) =>
							onPageSizeChange(Number(value) as PageSize)
						}
					>
						<SelectTrigger className="h-8 w-[72px] cursor-pointer">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PAGE_SIZE_OPTIONS.map((size) => (
								<SelectItem
									key={size}
									value={String(size)}
									className="cursor-pointer"
								>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Pagination className="mx-0 w-auto justify-end">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								disabled={page <= 1}
								onClick={() => onPageChange(Math.max(1, page - 1))}
							/>
						</PaginationItem>
						<PaginationItem>
							<span className="flex h-9 min-w-9 items-center justify-center px-2 text-sm text-muted-foreground">
								{page} / {safeTotalPages}
							</span>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								disabled={page >= safeTotalPages}
								onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
