import axios from "axios";
import type { User, UserRole } from "./types";

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const STRAPI_LOGIN_PATH = process.env.NEXT_PUBLIC_STRAPI_LOGIN_PATH ?? "/admin/login";

export const apiClient = axios.create({
  baseURL: STRAPI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("cms_token");
    if (token) {
      config.headers = config.headers ?? {};
      const value = token.startsWith("Bearer ") ? token : ` ${token}`;
      config.headers.Authorization = value;
    }
  }

  // ✅ Remove Content-Type for FormData so axios sets multipart boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

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
  user?: StrapiLoginUser;
  data?: {
    token?: string;
    jwt?: string;
    user?: StrapiLoginUser;
  };
  error?: {
    message?: string;
  } | string;
  message?: string;
};

export type StrapiLoginResult = {
  token: string;
  user: StrapiLoginUser;
};

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

export async function loginToStrapi(email: string, password: string): Promise<StrapiLoginResult> {
  const response = await apiClient.post<StrapiLoginResponse>(STRAPI_LOGIN_PATH, {
    email,
    identifier: email,
    password,
  });

  const payload = response.data.data ?? response.data;
  const token = payload.token ?? payload.jwt;
  const user = payload.user;

  if (!token || !user) {
    throw new Error("Strapi login did not return a token and user.");
  }

  return { token, user };
}