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
import { useSuppliers } from "@/modules/suppliers/hooks/use-suppliers";
import type { Supplier } from "@/modules/suppliers/types/api";

const DEBOUNCE_MS = 300;

interface SupplierComboboxProps {
	value: string;
	onValueChange: (id: string) => void;
	disabled?: boolean;
	fallbackLabel?: string;
	suppliers?: Supplier[];
}

export function SupplierCombobox({
	value,
	onValueChange,
	disabled,
	fallbackLabel,
	suppliers,
}: SupplierComboboxProps) {
	const [open, setOpen] = useState(false);
	const [searchRaw, setSearchRaw] = useState("");
	const debouncedSearch = useDebounce(searchRaw, DEBOUNCE_MS);

	const { data: fetchedData, isFetching } = useSuppliers({
		search: debouncedSearch || undefined,
		status: "true",
		limit: 50,
		page: 1,
	});

	const options: Supplier[] = suppliers?.length
		? suppliers
		: (fetchedData?.data ?? []);

	const selectedLabel = useMemo(() => {
		const hit = options.find((item: Supplier) => item.id === value);
		return hit?.name ?? (value ? (fallbackLabel ?? "") : "");
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
						{value ? selectedLabel : "Buscar proveedor..."}
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
						placeholder="Buscar proveedor..."
						value={searchRaw}
						onValueChange={setSearchRaw}
					/>
					<CommandList>
						<CommandEmpty>
							{isFetching ? "Cargando..." : "No hay proveedores."}
						</CommandEmpty>
						<CommandGroup>
							{options.map((item: Supplier) => (
								<CommandItem
									key={item.id}
									value={`${item.id}-${item.name}`}
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
									<span className="truncate">{item.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
