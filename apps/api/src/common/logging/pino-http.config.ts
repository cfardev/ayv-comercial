import { randomUUID } from "node:crypto";
import type {
	IncomingHttpHeaders,
	IncomingMessage,
	ServerResponse,
} from "node:http";
import type { ConfigService } from "@nestjs/config";
import pino from "pino";
import type { Options } from "pino-http";

type RequestWithId = IncomingMessage & {
	headers: IncomingHttpHeaders;
	id?: string | number;
	originalUrl?: string;
	params?: Record<string, unknown>;
	query?: Record<string, unknown>;
	method?: string;
	url?: string;
};

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
const DISABLED_VALUES = new Set(["0", "false", "no", "off"]);
const VALID_LOG_LEVELS = new Set<pino.LevelWithSilent>([
	"fatal",
	"error",
	"warn",
	"info",
	"debug",
	"trace",
	"silent",
]);

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
	if (!value) {
		return fallback;
	}

	const normalizedValue = value.trim().toLowerCase();

	if (ENABLED_VALUES.has(normalizedValue)) {
		return true;
	}

	if (DISABLED_VALUES.has(normalizedValue)) {
		return false;
	}

	return fallback;
}

function parseLogLevel(
	value: string | undefined,
	nodeEnv: string,
): pino.LevelWithSilent {
	const normalizedValue = value?.trim().toLowerCase();

	if (
		normalizedValue &&
		VALID_LOG_LEVELS.has(normalizedValue as pino.LevelWithSilent)
	) {
		return normalizedValue as pino.LevelWithSilent;
	}

	return nodeEnv === "production" ? "info" : "debug";
}

function getRequestPath(request: {
	originalUrl?: string;
	url?: string;
}): string {
	return request.originalUrl ?? request.url ?? "/";
}

export function createPinoHttpOptions(configService: ConfigService): Options {
	const nodeEnv = configService.get<string>("NODE_ENV", "development");
	const logLevel = parseLogLevel(
		configService.get<string>("LOG_LEVEL"),
		nodeEnv,
	);
	const shouldUsePrettyLogs = parseBoolean(
		configService.get<string>("LOG_PRETTY"),
		nodeEnv !== "production",
	);
	const shouldAutoLogHttp = parseBoolean(
		configService.get<string>("LOG_AUTO_HTTP"),
		true,
	);

	return {
		level: logLevel,
		autoLogging: shouldAutoLogHttp,
		timestamp: pino.stdTimeFunctions.isoTime,
		base: { service: "@ayv-comercial/api" },
		transport: shouldUsePrettyLogs
			? {
					target: "pino-pretty",
					options: {
						colorize: true,
						singleLine: true,
						translateTime: "SYS:standard",
					},
				}
			: undefined,
		redact: {
			paths: [
				"req.headers.authorization",
				"req.headers.cookie",
				"req.body.password",
				"req.body.currentPassword",
				"req.body.newPassword",
				"req.body.accessToken",
				"req.body.refreshToken",
				"req.body.token",
			],
			censor: "[Redacted]",
		},
		genReqId: (request: RequestWithId, response: ServerResponse) => {
			const incomingRequestId = Array.isArray(request.headers["x-request-id"])
				? request.headers["x-request-id"][0]
				: request.headers["x-request-id"];

			const requestId =
				typeof incomingRequestId === "string" &&
				incomingRequestId.trim().length > 0
					? incomingRequestId
					: randomUUID();

			response.setHeader("x-request-id", requestId);
			return requestId;
		},
		customLogLevel: (_request, response, error) => {
			if (error || response.statusCode >= 500) {
				return "error";
			}

			if (response.statusCode >= 400) {
				return "warn";
			}

			return "info";
		},
		serializers: {
			req: (request: RequestWithId) => ({
				id: request.id,
				method: request.method,
				url: getRequestPath(request),
			}),
			res: (response: ServerResponse) => ({
				statusCode: response.statusCode,
			}),
		},
		customProps: (request: RequestWithId) => ({
			requestId: request.id,
		}),
		customSuccessMessage: (request, response, responseTime) =>
			`${request.method ?? "UNKNOWN"} ${getRequestPath(request)} ${response.statusCode} +${responseTime}ms`,
		customErrorMessage: (request, response, error) =>
			`${request.method ?? "UNKNOWN"} ${getRequestPath(request)} ${response.statusCode} ${error.name}`,
	};
}
