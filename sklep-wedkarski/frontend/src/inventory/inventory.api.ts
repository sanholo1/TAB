import type { Product } from "../products/products.types";
import type { InventoryProduct, InventoryProductPayload } from "./inventory.types";

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
      return payload.message.replace(/—/g, "-");
    }
  } catch {
    // Ignore malformed or empty response body.
  }

  return fallback;
};

export async function fetchInventoryProducts(): Promise<InventoryProduct[]> {
  const res = await fetch(`${BASE_URL}/inventory/products`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch inventory products"));
  return res.json();
}

export async function uploadInventoryImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to upload image"));
  return res.json();
}

export async function createInventoryProduct(payload: InventoryProductPayload): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to create inventory product"));
  return res.json();
}

export async function updateInventoryProduct(id: number, payload: Partial<InventoryProductPayload>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to update inventory product"));
  return res.json();
}

export async function updateInventoryStock(id: number, ilosc: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${id}/stock`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ ilosc }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to update inventory stock"));
  return res.json();
}

export async function deleteInventoryProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/inventory/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to delete inventory product"));
}

export async function setInventoryProductVisibility(id: number, aktywny: boolean): Promise<InventoryProduct> {
  const res = await fetch(`${BASE_URL}/inventory/products/${id}/visibility`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ aktywny }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to change product visibility"));
  return res.json();
}

export async function setInventoryProductPromotion(id: number, cena_prom: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/promotions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ cena_prom }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to set product promotion"));
  return res.json();
}

export async function clearInventoryProductPromotion(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/promotions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to clear product promotion"));
  return res.json();
}
