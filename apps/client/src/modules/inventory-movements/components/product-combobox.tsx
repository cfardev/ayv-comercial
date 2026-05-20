import { IconChevronDown } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useProducts } from "@/modules/products/hooks/use-products.js";
import type { Product } from "@/modules/products/types/api";

const DEBOUNCE_MS = 300;

interface ProductComboboxProps {
	value: string;
	onValueChange: (id: string) => void;
	disabled?: boolean;
	fallbackLabel?: string;
}

export function ProductCombobox({
	value,
	onValueChange,
	disabled,
	fallbackLabel,
}: ProductComboboxProps) {
	const [open, setOpen] = useState(false);
	const [searchRaw, setSearchRaw] = useState("");
	const debouncedSearch = useDebounce(searchRaw, DEBOUNCE_MS);

	const { data: fetchedData, isFetching } = useProducts({
		search: debouncedSearch || undefined,
		status: "true",
		limit: 50,
		page: 1,
	});

	const options: Product[] = fetchedData?.data ?? [];

	const selectedLabel = useMemo(() => {
		const hit = options.find((item: Product) => item.id === value);
		return hit
			? `${hit.name} (${hit.code})`
			: value
				? (fallbackLabel ?? "")
				: "";
	}, [options, value, fallbackLabel]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"cursor-pointer w-full justify-between font-normal",
						!value ? "text-muted-foreground" : "",
					)}
				>
					<span className="truncate">
						{value ? selectedLabel : "Buscar producto..."}
					</span>
					<IconChevronDown className="size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start"
			>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Buscar producto..."
						value={searchRaw}
						onValueChange={setSearchRaw}
					/>
					<CommandList>
						<CommandEmpty>
							{isFetching ? "Cargando..." : "No hay productos."}
						</CommandEmpty>
						<CommandGroup>
							{options.map((item: Product) => (
								<CommandItem
									key={item.id}
									value={`${item.id}-${item.name}-${item.code}`}
									disabled={Boolean(disabled)}
									className={cn(
										"cursor-pointer data-[checked=true]:bg-muted",
										item.id === value && "bg-muted",
									)}
									onSelect={() => {
										onValueChange(item.id);
										setOpen(false);
										setSearchRaw("");
									}}
								>
									<span className="truncate">
										{item.name}{" "}
										<span className="text-muted-foreground text-xs font-mono">
											({item.code})
										</span>
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
