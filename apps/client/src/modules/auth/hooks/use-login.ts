import { useMutation } from "@tanstack/react-query";
import type { AuthUser } from "@/lib/auth-context";

interface LoginResponse {
	accessToken: string;
	expiresIn: number;
	user: AuthUser;
}

interface LoginPayload {
	email: string;
	password: string;
}

async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message ?? "Credenciales inv\u00e1lidas");
	}

	return res.json();
}

export function useLoginMutation() {
	return useMutation({
		mutationFn: loginRequest,
	});
}
