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
import { useUsers } from "@/modules/users/hooks/use-users.js";
import type { User } from "@/modules/users/types/api";

const DEBOUNCE_MS = 300;

interface UserComboboxProps {
	value: string;
	onValueChange: (id: string) => void;
	disabled?: boolean;
	fallbackLabel?: string;
}

export function UserCombobox({
	value,
	onValueChange,
	disabled,
	fallbackLabel,
}: UserComboboxProps) {
	const [open, setOpen] = useState(false);
	const [searchRaw, setSearchRaw] = useState("");
	const debouncedSearch = useDebounce(searchRaw, DEBOUNCE_MS);

	const { data: fetchedData, isFetching } = useUsers({
		search: debouncedSearch || undefined,
		status: "ACTIVE",
		limit: 50,
		page: 1,
	});

	const options: User[] = fetchedData?.data ?? [];

	const selectedLabel = useMemo(() => {
		const hit = options.find((item: User) => item.id === value);
		return hit?.fullName ?? (value ? (fallbackLabel ?? "") : "");
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
						{value ? selectedLabel : "Buscar usuario..."}
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
						placeholder="Buscar usuario..."
						value={searchRaw}
						onValueChange={setSearchRaw}
					/>
					<CommandList>
						<CommandEmpty>
							{isFetching ? "Cargando..." : "No hay usuarios."}
						</CommandEmpty>
						<CommandGroup>
							{options.map((item: User) => (
								<CommandItem
									key={item.id}
									value={`${item.id}-${item.fullName}`}
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
									<span className="truncate">{item.fullName}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
