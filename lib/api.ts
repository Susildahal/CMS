import axios from "axios";
import type { User, UserRole } from "./types";

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_LOGIN_PATH = process.env.NEXT_PUBLIC_STRAPI_LOGIN_PATH ?? "/admin/login";

// ─── Types ───────────────────────────────────────────────────────────────────

export type StrapiLoginUser = {
  id?: number | string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  createdAt?: string;
  blocked?: boolean;
  confirmed?: boolean;
  role?: {
    name?: string;
    code?: string;
  };
  roles?: Array<{
    name?: string;
    code?: string;
  }>;
};

export type StrapiLoginResponse = {
  token?: string;
  jwt?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: StrapiLoginUser;
  data?: {
    token?: string;
    jwt?: string;
    refreshToken?: string;
    refresh_token?: string;
    user?: StrapiLoginUser;
  };
  error?: { message?: string } | string;
  message?: string;
};

export type StrapiLoginResult = {
  token: string;
  user: StrapiLoginUser;
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: STRAPI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("cms_token");
    if (token) {
      config.headers = config.headers ?? {};
      const clean = token.trim();

      // Strapi expects: Authorization: Bearer <jwt>
      // Store may contain either raw jwt or already-prefixed token.
      const value = /^bearer\s+/i.test(clean) ? clean : `Bearer ${clean}`;
      config.headers.Authorization = value;
    }
  }

  // ✅ Remove Content-Type for FormData so axios sets multipart boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// ─── Response Interceptor (auto refresh) ─────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("cms_refresh_token");

        if (!refreshToken) throw new Error("No refresh token");

        // ✅ Strapi admin renew token endpoint
        const res = await axios.post(
          `${STRAPI_BASE_URL}/admin/renew-token`,
          { token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newToken = res.data?.data?.token;
        if (!newToken) throw new Error("Refresh failed");

        localStorage.setItem("cms_token", newToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ✅ Refresh failed — clear and redirect to login
        // localStorage.removeItem("cms_token");
        // localStorage.removeItem("cms_refresh_token");

        if (typeof window !== "undefined") {
          // window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | StrapiLoginResponse
      | { error?: { message?: string } | string; message?: string }
      | undefined;

    const responseMessage =
      typeof responseData?.error === "string"
        ? responseData.error
        : responseData?.error?.message ?? responseData?.message;

    return responseMessage ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function normalizeRole(roleName?: string): UserRole {
  const value = roleName?.toLowerCase() ?? "";
  if (value.includes("editor")) return "editor";
  if (value.includes("viewer")) return "viewer";
  return "admin";
}

export function mapStrapiUserToCmsUser(user: StrapiLoginUser, fallbackEmail = ""): User {
  const name =
    [user.firstname, user.lastname].filter(Boolean).join(" ").trim() ||
    user.username ||
    user.email ||
    fallbackEmail ||
    "Strapi User";

  const roleName =
    user.role?.code ?? user.role?.name ?? user.roles?.[0]?.code ?? user.roles?.[0]?.name;

  return {
    id: String(user.id ?? user.email ?? fallbackEmail ?? name),
    name,
    email: user.email ?? fallbackEmail,
    role: normalizeRole(roleName),
    avatar: "",
    createdAt: user.createdAt ?? new Date().toISOString(),
    status: user.blocked ? "suspended" : "active",
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginToStrapi(
  email: string,
  password: string
): Promise<StrapiLoginResult> {
  const response = await apiClient.post<StrapiLoginResponse>(STRAPI_LOGIN_PATH, {
    email,
    password,
  });

  const payload = response.data?.data ?? response.data;
  const token = payload?.token ?? payload?.jwt;
  const user = payload?.user;

  if (!token || !user) {
    throw new Error("Strapi login did not return a token and user.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("cms_token", token);

    // ✅ Save refresh token if Strapi returns one
    const refreshToken = payload?.refreshToken ?? payload?.refresh_token;
    if (refreshToken) {
      localStorage.setItem("cms_refresh_token", refreshToken);
    }
  }

  return { token, user };
}