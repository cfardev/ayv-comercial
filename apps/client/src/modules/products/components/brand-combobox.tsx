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
import { useDebounce } from "@/hooks/use-debounce.js";
import { cn } from "@/lib/utils";
import { useBrands } from "@/modules/brands/hooks/use-brands.js";

const DEBOUNCE_MS = 300;

export interface BrandComboboxProps {
	value: string;
	onValueChange: (id: string) => void;
	disabled?: boolean;
	/** Title shown when API list has not hydrated yet */
	fallbackLabel?: string | null;
}

export function BrandCombobox({
	value,
	onValueChange,
	disabled,
	fallbackLabel,
}: BrandComboboxProps) {
	const [open, setOpen] = useState(false);
	const [searchRaw, setSearchRaw] = useState("");
	const debouncedSearch = useDebounce(searchRaw, DEBOUNCE_MS);

	const { data: brands = [], isFetching } = useBrands({
		search: debouncedSearch || undefined,
		limit: 50,
	});

	const selectedLabel = useMemo(() => {
		const hit = brands.find((b) => b.id === value);
		return hit?.name ?? (value ? (fallbackLabel ?? "") : "");
	}, [brands, value, fallbackLabel]);

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
						{value ? selectedLabel : "Buscar marca…"}
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
						placeholder="Buscar marca…"
						value={searchRaw}
						onValueChange={setSearchRaw}
					/>
					<CommandList>
						<CommandEmpty>
							{isFetching ? "Cargando…" : "No hay marcas."}
						</CommandEmpty>
						<CommandGroup>
							{brands.map((b) => (
								<CommandItem
									key={b.id}
									value={`${b.id}-${b.name}`}
									disabled={Boolean(disabled)}
									className={cn(
										"cursor-pointer data-[checked=true]:bg-muted",
										b.id === value && "bg-muted",
									)}
									onSelect={() => {
										onValueChange(b.id);
										setOpen(false);
										setSearchRaw("");
									}}
								>
									<span className="truncate">{b.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
