import axios from "axios";
import type { User, UserRole } from "./types";

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_LOGIN_PATH = process.env.NEXT_PUBLIC_STRAPI_LOGIN_PATH ?? "/admin/login";
const STRAPI_USERS_PERMISSIONS_LOGIN_PATH = process.env.NEXT_PUBLIC_STRAPI_USERS_PERMISSIONS_LOGIN_PATH ?? "/api/auth/local";
const STRAPI_CONTENT_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_CONTENT_API_TOKEN ?? "";

const AUTH_STORAGE_KEY = "cms_auth";
const DASHBOARD_JWT_KEY = "dashboard_jwt";
const CMS_USER_JWT_KEY = "cms_user_token";

function stripBearer(value: string) {
  // Always return the raw token (no "Bearer " prefix)
  return value.trim().replace(/^bearer\s+/i, "");
}

function toAuthHeader(value: string) {
  const token = stripBearer(value);
  // Strapi expects a Bearer token for both Admin API JWTs and API tokens.
  return token ? `Bearer ${token}` : "";
}

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
  accessToken?: string;
  jwt?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: StrapiLoginUser;
  data?: {
    token?: string;
    accessToken?: string;
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
    // Prefer cms_token, but fall back to the persisted session if needed.
    let token: string | null = window.localStorage.getItem("cms_token");
    let userToken: string | null = window.localStorage.getItem(CMS_USER_JWT_KEY);

    // If user is using the /api/auth/local login flow, they may store the JWT here.
    if (!token) {
      token = window.localStorage.getItem(DASHBOARD_JWT_KEY);
      if (token) window.localStorage.setItem("cms_token", stripBearer(token));
    }

    if (!token) {
      try {
        const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (rawSession) {
          const parsed = JSON.parse(rawSession) as { token?: unknown };
          const maybeToken = typeof parsed?.token === "string" ? parsed.token : null;
          token = maybeToken;
          if (token) window.localStorage.setItem("cms_token", stripBearer(token));
        }
      } catch {
        // ignore
      }
    }

    // Ensure we always work with the raw token (no Bearer prefix) in storage.
    token = token ? stripBearer(token) : token;
    userToken = userToken ? stripBearer(userToken) : userToken;

    // Decide which credential should be used.
    // - /admin/* expects an admin JWT
    // - /api/* can be public, users-permissions JWT, or an API token.
    //   If NEXT_PUBLIC_STRAPI_CONTENT_API_TOKEN is set, prefer it for /api/* requests.
    const url = config.url ?? "";
    let pathname = url;
    try {
      pathname = new URL(url, STRAPI_BASE_URL).pathname;
    } catch {
      // Keep raw url string.
    }

    const isContentApi = /^\/api\b/i.test(pathname);
    const isAdminApi = /^\/admin\b/i.test(pathname);

    const contentApiToken = stripBearer(STRAPI_CONTENT_API_TOKEN);

    // For direct requests:
    // - /admin/* uses the admin JWT
    // - /api/* prefers the per-user JWT, then the admin token, then an optional public API token
    const preferredToken = isAdminApi
      ? token
      : (isContentApi
        ? (userToken ?? token ?? contentApiToken ?? null)
        : token);

    const existingAuthHeader =
      (config.headers as any)?.Authorization ?? (config.headers as any)?.authorization;

    // Don't clobber an explicitly set Authorization header.
    if (preferredToken && !existingAuthHeader) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = toAuthHeader(preferredToken);
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
      // Only try the admin renew-token flow for admin endpoints.
      // Content API 401s should be handled by permissions / API tokens.
      const reqUrl = originalRequest?.url ?? "";
      let reqPathname = reqUrl;
      try {
        reqPathname = new URL(reqUrl, STRAPI_BASE_URL).pathname;
      } catch {
        // keep raw
      }
      const isAdminRequest = /^\/admin\b/i.test(reqPathname);

      if (!isAdminRequest) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = toAuthHeader(String(token));
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("cms_refresh_token");

        if (!refreshToken) {
          // No refresh token available → force re-login.
          if (typeof window !== "undefined") {
            localStorage.removeItem("cms_token");
            localStorage.removeItem("cms_refresh_token");
            localStorage.removeItem(AUTH_STORAGE_KEY);
            window.location.href = "/login";
          }
          throw new Error("No refresh token");
        }

        // ✅ Strapi admin renew token endpoint
        const res = await axios.post(
          `${STRAPI_BASE_URL}/admin/renew-token`,
          { token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newToken =
          res.data?.data?.token ??
          res.data?.data?.accessToken ??
          res.data?.token ??
          res.data?.accessToken;
        if (!newToken) throw new Error("Refresh failed");

        const cleanNewToken = stripBearer(String(newToken));

        localStorage.setItem("cms_token", cleanNewToken);
        apiClient.defaults.headers.common.Authorization = toAuthHeader(cleanNewToken);

        processQueue(null, cleanNewToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = toAuthHeader(cleanNewToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ✅ Refresh failed — clear and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("cms_token");
          localStorage.removeItem("cms_refresh_token");
          localStorage.removeItem(AUTH_STORAGE_KEY);
          window.location.href = "/login";
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
  const isUsersPermissionsLocalAuth = /^\/?api\/auth\/local\b/i.test(STRAPI_LOGIN_PATH);

  let token: string | undefined;
  let user: StrapiLoginUser | undefined;
  let refreshToken: string | undefined;

  if (isUsersPermissionsLocalAuth) {
    // Use the exact fetch flow you requested.
    const url = new URL(STRAPI_LOGIN_PATH, STRAPI_BASE_URL).toString();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: email.trim(),
        password,
      }),
    });

    const data = (await res.json()) as any;

    if (!res.ok) {
      throw new Error(data?.error?.message || "Login failed");
    }

    token = data?.jwt;
    user = data?.user;
  } else {
    // Strapi admin login expects: { email, password }
    const response = await apiClient.post<StrapiLoginResponse>(STRAPI_LOGIN_PATH, { email, password });
    const payload = response.data?.data ?? response.data;
    token = payload?.token ?? payload?.accessToken ?? payload?.jwt;
    user = payload?.user;
    refreshToken = payload?.refreshToken ?? payload?.refresh_token;
  }

  if (!token || !user) {
    throw new Error("Strapi login did not return a token and user.");
  }

  const cleanToken = stripBearer(String(token));

  if (typeof window !== "undefined") {
    // Store only the raw JWT (no 'Bearer ' prefix).
    localStorage.setItem("cms_token", cleanToken);
    localStorage.setItem(DASHBOARD_JWT_KEY, cleanToken);

    // ✅ Save refresh token if Strapi returns one
    if (refreshToken) localStorage.setItem("cms_refresh_token", refreshToken);
  }

  return { token: cleanToken, user };
}

// ─── Users & Permissions Login (for dynamic RBAC on /api/*) ─────────────────

export async function loginToUsersPermissions(
  email: string,
  password: string
): Promise<StrapiLoginResult> {
  const url = new URL(STRAPI_USERS_PERMISSIONS_LOGIN_PATH, STRAPI_BASE_URL).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: email.trim(),
      password,
    }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(data?.error?.message || "Users & Permissions login failed");
  }

  const token = data?.jwt;
  const user = data?.user;
  if (!token || !user) {
    throw new Error("Users & Permissions login did not return jwt and user.");
  }

  const cleanToken = stripBearer(String(token));
  if (typeof window !== "undefined") {
    localStorage.setItem(CMS_USER_JWT_KEY, cleanToken);
  }

  return { token: cleanToken, user };
}