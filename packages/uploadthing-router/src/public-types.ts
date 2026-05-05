/**
 * Public type stub for `@uploadthing/react` helpers.
 * Route slugs must match `uploadRouter` in `./index.ts`.
 */
export type OurFileRouter = {
	productImages: {
		/**
		 * File input config mirror — only the route key is used for narrowing in helpers.
		 */
		image: {
			maxFileSize: "4MB";
			maxFileCount: 10;
		};
	};
};
