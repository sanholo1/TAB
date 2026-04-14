import type { Order, OrderAddress } from "./orders.types";

const BASE_URL = "http://localhost:3000";

const getToken = () => localStorage.getItem("auth_token");

const getAuthHeaders = (withJsonContentType: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};

  if (withJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const getErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  if (res.status === 403) {
    return "Brak uprawnień do wykonania tej akcji.";
  }

  try {
    const payload = (await res.json()) as { message?: string };
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Ignore malformed response
  }

  return fallback;
};

export type CreateOrderPayload = Omit<OrderAddress, "id_adres">;

export type CreateGuestOrderPayload = CreateOrderPayload & {
  items: Array<{ id_przedmiotu: number; ilosc: number }>;
};

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch orders"));
  return res.json();
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to create order"));
  return res.json();
}

export async function createGuestOrder(payload: CreateGuestOrderPayload): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/guest`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to create guest order"));
  return res.json();
}

export async function fetchOrderById(id: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Order not found"));
  return res.json();
}

export async function updateOrderStatus(id: number, stan: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ stan }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to update order status"));
  return res.json();
}

export async function fetchLastAddress(): Promise<{ address: OrderAddress | null }> {
  const res = await fetch(`${BASE_URL}/orders/last-address`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch last address"));
  return res.json();
}
