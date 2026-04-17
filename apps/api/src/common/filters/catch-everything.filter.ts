import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

type HttpExceptionResponse = {
	message?: string | string[];
	error?: string;
	[key: string]: unknown;
};

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
	private readonly logger = new Logger(CatchEverythingFilter.name);

	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<{
			method?: string;
			params?: Record<string, unknown>;
			query?: Record<string, unknown>;
		}>();

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const path = httpAdapter.getRequestUrl(request);
		const method = request.method ?? "UNKNOWN";
		const isProduction = process.env.NODE_ENV === "production";

		const responseBody: Record<string, unknown> = {
			statusCode: httpStatus,
			timestamp: new Date().toISOString(),
			path,
			method,
		};

		if (exception instanceof HttpException) {
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === "string") {
				responseBody.message = exceptionResponse;
			} else {
				const parsedResponse = exceptionResponse as HttpExceptionResponse;
				responseBody.message = parsedResponse.message ?? exception.message;
				responseBody.error = parsedResponse.error ?? exception.name;
				responseBody.details = exceptionResponse;
			}
		} else if (exception instanceof Error) {
			responseBody.message = exception.message;
			responseBody.error = exception.name;
		} else {
			responseBody.message = "Internal server error";
			responseBody.error = "UnknownError";
		}

		this.logger.error(
			`${method} ${path} -> ${httpStatus}`,
			exception instanceof Error ? exception.stack : JSON.stringify(exception),
		);

		if (!isProduction) {
			responseBody.context = {
				params: request.params ?? {},
				query: request.query ?? {},
			};

			if (exception instanceof Error) {
				responseBody.stack = exception.stack;
			}
		}

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
