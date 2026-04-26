import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";

interface User {
	id: string;
	fullName: string;
	email: string;
	role: { name: string };
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
}

interface AuthContextType extends AuthState {
	login: (email: string, password: string) => Promise<User>;
	logout: () => void;
}

const AUTH_STORAGE_KEY = "auth";
const JWT_EXPIRATION = Number(import.meta.env.VITE_JWT_EXPIRATION) || 86400;

function getStoredAuth(): AuthState | null {
	try {
		const raw = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as AuthState & { expiresAt: number };
		if (Date.now() > parsed.expiresAt) {
			localStorage.removeItem(AUTH_STORAGE_KEY);
			return null;
		}
		return { user: parsed.user, accessToken: parsed.accessToken };
	} catch {
		return null;
	}
}

function storeAuth(data: AuthState): void {
	const expiresAt = Date.now() + JWT_EXPIRATION * 1000;
	localStorage.setItem(
		AUTH_STORAGE_KEY,
		JSON.stringify({ ...data, expiresAt }),
	);
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>(
		() => getStoredAuth() ?? { user: null, accessToken: null },
	);
	const navigate = useNavigate();

	const logout = useCallback(() => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		setState({ user: null, accessToken: null });
		navigate("/login", { replace: true });
	}, [navigate]);

	const login = useCallback(
		async (email: string, password: string): Promise<User> => {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message ?? "Credenciales inválidas");
			}

			const data = (await res.json()) as { accessToken: string; user: User };
			const newState = { user: data.user, accessToken: data.accessToken };
			storeAuth(newState);
			setState(newState);
			return data.user;
		},
		[],
	);

	useEffect(() => {
		if (!state.accessToken) {
			navigate("/login", { replace: true });
		}
	}, [state.accessToken, navigate]);

	return (
		<AuthContext.Provider value={{ ...state, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextType {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
