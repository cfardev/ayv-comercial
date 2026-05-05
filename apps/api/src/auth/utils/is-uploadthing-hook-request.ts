/**
 * UploadThing sends server-to-server POSTs with this header (no end-user JWT).
 * Auth is enforced via `x-uploadthing-signature` inside the UploadThing handler.
 */
export function isUploadThingHookRequest(
	headers: Record<string, string | string[] | undefined>,
): boolean {
	const raw = headers["uploadthing-hook"];
	const hook = Array.isArray(raw) ? raw[0] : raw;
	return hook === "callback" || hook === "error";
}
