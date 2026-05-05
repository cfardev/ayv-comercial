import { uploadRouter } from "@ayv-comercial/uploadthing-router";
import { All, Controller, Next, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NextFunction, Request, Response, Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator.js";
import { PermissionsGuard } from "../../auth/guards/permissions.guard.js";
import { PERMISSION_KEYS } from "../../auth/permissions/permission-keys.js";

@Controller("uploadthing")
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSION_KEYS.PRODUCTS_UPLOAD)
export class UploadthingController {
	private readonly uploadHandler: Router;

	constructor(configService: ConfigService) {
		const token = configService.get<string>("UPLOADTHING_TOKEN") ?? "";
		this.uploadHandler = createRouteHandler({
			router: uploadRouter,
			config: { token: token || undefined },
		});
	}

	/**
	 * `uploadthing/express#createRouteHandler` uses `Router().all("/")` as an **exact**
	 * route (`end: true`). Nest forwards requests with {@link Request.url}
	 * `/api/uploadthing...`, which does **not** match `/`, so the inner router bubbles
	 * `next()` and Nest emits `Cannot POST /api/uploadthing` (404). Normalize to the
	 * path UploadThing expects as if mounted at `/api/uploadthing`, then restore
	 * `req.url` after the handler finishes so downstream code does not see a mutated URL.
	 */
	private delegateUploadThing(
		req: Request,
		res: Response,
		nestNext: NextFunction,
	): void {
		const marker = "/uploadthing";
		const originalUrl = typeof req.url === "string" ? req.url : "/";
		const q = originalUrl.indexOf("?");
		const rawPath = q === -1 ? originalUrl : originalUrl.slice(0, q);
		const search = q === -1 ? "" : originalUrl.slice(q);

		const markerIdx = rawPath.lastIndexOf(marker);
		let innerPath =
			markerIdx === -1 ? "/" : rawPath.slice(markerIdx + marker.length) || "/";
		if (!innerPath.startsWith("/")) {
			innerPath = `/${innerPath}`;
		}

		req.url = `${innerPath}${search}`;

		let cleaned = false;
		const cleanup = (): void => {
			if (cleaned) {
				return;
			}
			cleaned = true;
			req.url = originalUrl;
			res.removeListener("finish", cleanup);
			res.removeListener("close", cleanup);
		};
		res.once("finish", cleanup);
		res.once("close", cleanup);

		const innerNext = (err?: unknown): void => {
			cleanup();
			nestNext(err as never);
		};

		void this.uploadHandler(req, res, innerNext);
	}

	/**
	 * `@All("*")` alone only matches `/uploadthing/<segment>`; UploadThing POSTs at the mount root.
	 */
	@All()
	handleRoot(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	): void {
		this.delegateUploadThing(req, res, next);
	}

	@All("*")
	handleSubpath(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	): void {
		this.delegateUploadThing(req, res, next);
	}
}
