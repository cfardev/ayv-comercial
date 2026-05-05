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

	@All("*")
	handle(
		@Req() req: Request,
		@Res() res: Response,
		@Next() next: NextFunction,
	): void {
		void this.uploadHandler(req, res, next);
	}
}
