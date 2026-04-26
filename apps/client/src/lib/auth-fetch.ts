const AUTH_STORAGE_KEY = "auth";

function getAccessToken(): string | null {
	try {
		const raw = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { accessToken: string | null };
		return parsed.accessToken ?? null;
	} catch {
		return null;
	}
}

interface FetchOptions extends RequestInit {
	authenticated?: boolean;
}

export async function authFetch(
	url: string,
	options: FetchOptions = {},
): Promise<Response> {
	const { authenticated = true, ...fetchOptions } = options;

	const headers = new Headers(fetchOptions.headers);
	if (authenticated) {
		const token = getAccessToken();
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
	}

	if (
		!headers.has("Content-Type") &&
		!(fetchOptions.body instanceof FormData)
	) {
		headers.set("Content-Type", "application/json");
	}

	return fetch(url, {
		...fetchOptions,
		headers,
	});
}
