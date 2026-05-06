import { generateReactHelpers } from "@uploadthing/react";

export const UPLOADTHING_API_URL = "/api/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers({
	url: UPLOADTHING_API_URL,
});
