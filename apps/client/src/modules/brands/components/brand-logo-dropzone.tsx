import { IconTrash, IconUpload } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth-fetch.js";
import { useUploadThing } from "@/lib/uploadthing.js";
import { cn } from "@/lib/utils.js";

const MAX_BYTES = 4 * 1024 * 1024;

export interface BrandLogoDropzoneProps {
	value: string | null | undefined;
	onChange: (next: string) => void;
	disabled?: boolean;
}

export function BrandLogoDropzone({
	value,
	onChange,
	disabled,
}: BrandLogoDropzoneProps) {
	const [error, setError] = useState<string | null>(null);

	const { startUpload, isUploading } = useUploadThing("brandLogos", {
		headers: () => {
			const token = getAccessToken();
			const h: Record<string, string> = {};
			if (token) h.Authorization = `Bearer ${token}`;
			return h;
		},
		onUploadError: (err) => {
			setError(err.message);
		},
	});

	const onDrop = useCallback(
		async (accepted: File[]) => {
			setError(null);
			if (accepted.length === 0 || disabled) return;
			const file = accepted[0];
			const result = await startUpload([file]);
			const url = result?.[0]?.url;
			if (url) onChange(url);
		},
		[disabled, onChange, startUpload],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		maxFiles: 1,
		maxSize: MAX_BYTES,
		disabled: Boolean(disabled) || isUploading,
		noClick: isUploading,
	});

	const hasLogo = Boolean(value?.trim());

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
				{hasLogo ? (
					<div className="relative size-24 shrink-0 overflow-hidden rounded-md border">
						<img
							src={value ?? ""}
							alt=""
							className="size-full object-contain"
						/>
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute right-1 top-1 size-7 cursor-pointer opacity-90"
							disabled={disabled || isUploading}
							onClick={() => onChange("")}
						>
							<IconTrash className="size-3.5" />
						</Button>
					</div>
				) : null}
				<div
					{...getRootProps()}
					className={cn(
						"flex min-h-[100px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors",
						isDragActive && "border-primary bg-primary/5",
						(disabled || isUploading) && "cursor-not-allowed opacity-60",
					)}
				>
					<input {...getInputProps()} />
					<IconUpload className="size-6 text-muted-foreground" />
					<p className="text-center text-xs text-muted-foreground">
						{isUploading
							? "Subiendo…"
							: "Arrastra un logo o haz clic (máx. 4 MB, una imagen)."}
					</p>
				</div>
			</div>

			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
