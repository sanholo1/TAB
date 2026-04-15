import type { User } from "./auth.types";
import type { Order } from "../orders/orders.types";

const BASE_URL = "http://localhost:3000";

const getToken = () => localStorage.getItem("auth_token");

type ApiError = Error & {
  status?: number;
  details?: string[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || "Błąd sieci";
    const error = new Error(message) as ApiError;
    error.status = response.status;
    if (Array.isArray(payload?.details)) {
      error.details = payload.details;
    }
    throw error;
  }

  return payload as T;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ProfileUpdatePayload = Partial<{
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}>;

export const loginUser = async (payload: LoginPayload): Promise<{ accessToken: string; user: User }> =>
  request<{ accessToken: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const registerUser = async (payload: RegisterPayload): Promise<{ message: string; redirectTo: string; accessToken?: string; user?: User }> =>
  request<{ message: string; redirectTo: string; accessToken?: string; user?: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchProfile = async (): Promise<User> =>
  request<User>("/profile");

export const updateProfile = async (payload: ProfileUpdatePayload): Promise<{ message: string; profile: User }> =>
  request<{ message: string; profile: User }>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const fetchOrders = async (): Promise<Order[]> =>
  request<Order[]>("/orders");
