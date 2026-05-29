import { useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 20;

export function usePaginationState(
	initialPageSize: PageSize = DEFAULT_PAGE_SIZE,
) {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

	function handlePageSizeChange(next: PageSize) {
		setPageSize(next);
		setPage(1);
	}

	function resetPage() {
		setPage(1);
	}

	return {
		page,
		setPage,
		pageSize,
		setPageSize: handlePageSizeChange,
		resetPage,
	};
}
