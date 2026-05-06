import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth-fetch.js";
import { useUploadThing } from "@/lib/uploadthing.js";
import { cn } from "@/lib/utils.js";

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 10;

export interface ProductImageValue {
	url: string;
	fileKey?: string;
	sortOrder: number;
}

interface ProductImageDropzoneProps {
	value: ProductImageValue[];
	onChange: (next: ProductImageValue[]) => void;
	disabled?: boolean;
}

export function ProductImageDropzone({
	value,
	onChange,
	disabled,
}: ProductImageDropzoneProps) {
	const valueRef = useRef(value);
	valueRef.current = value;

	const [error, setError] = useState<string | null>(null);

	const { startUpload, isUploading } = useUploadThing("productImages", {
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

			const base = valueRef.current;
			const room = MAX_IMAGES - base.length;
			if (room <= 0) return;

			const batch = accepted.slice(0, room);
			const result = await startUpload(batch);
			if (!result?.length) return;

			const next = [...base];
			let order = next.length;
			for (const f of result) {
				next.push({
					url: f.url,
					fileKey: f.key,
					sortOrder: order,
				});
				order += 1;
			}
			onChange(next);
		},
		[disabled, onChange, startUpload],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		maxSize: MAX_BYTES,
		disabled: Boolean(disabled) || isUploading,
		noClick: isUploading,
	});

	function removeAt(index: number) {
		onChange(
			value
				.filter((_, i) => i !== index)
				.map((img, i) => ({ ...img, sortOrder: i })),
		);
	}

	const atCapacity = value.length >= MAX_IMAGES;

	return (
		<div className="space-y-3">
			<div
				{...getRootProps()}
				className={cn(
					"flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
					isDragActive && "border-primary bg-primary/5",
					(disabled || isUploading || atCapacity) &&
						"cursor-not-allowed opacity-60",
				)}
			>
				<input {...getInputProps()} />
				<IconUpload className="size-8 text-muted-foreground" />
				<p className="text-center text-sm text-muted-foreground">
					{atCapacity
						? "Máximo 10 imágenes."
						: isUploading
							? "Subiendo…"
							: "Arrastra imágenes o haz clic (máx. 4 MB c/u)."}
				</p>
			</div>

			{error ? <p className="text-sm text-destructive">{error}</p> : null}

			{value.length > 0 ? (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{value.map((img, i) => (
						<li
							key={`${img.url}#${img.sortOrder}`}
							className="group relative overflow-hidden rounded-md border"
						>
							<img
								src={img.url}
								alt=""
								className="aspect-square w-full object-cover"
							/>
							<Button
								type="button"
								variant="destructive"
								size="icon"
								className="absolute right-1 top-1 size-8 cursor-pointer opacity-90"
								disabled={disabled || isUploading}
								onClick={() => removeAt(i)}
							>
								<IconTrash className="size-4" />
							</Button>
						</li>
					))}
				</ul>
			) : (
				<p className="flex items-center gap-2 text-sm text-muted-foreground">
					<IconPhoto className="size-4 shrink-0" />
					Al menos una imagen es obligatoria.
				</p>
			)}
		</div>
	);
}
