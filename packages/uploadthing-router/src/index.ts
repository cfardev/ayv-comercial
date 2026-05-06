import type { Request } from "express";
import {
	createUploadthing,
	type FileRouter,
} from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";

type AuthedRequest = Request & {
	user?: { userId: string; email: string; roleSlug: string; roleName?: string };
};

const f = createUploadthing();

export const uploadRouter = {
	productImages: f({
		image: { maxFileSize: "4MB", maxFileCount: 10 },
	})
		.middleware(async ({ req }) => {
			const u = (req as AuthedRequest).user;
			if (!u?.userId) {
				throw new UploadThingError("No autorizado");
			}
			return { userId: u.userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			void metadata;
			void file;
		}),
	brandLogos: f({
		image: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async ({ req }) => {
			const u = (req as AuthedRequest).user;
			if (!u?.userId) {
				throw new UploadThingError("No autorizado");
			}
			return { userId: u.userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			void metadata;
			void file;
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
