// API service for Paweł – ready-made fetch functions to the backend
// Paweł only imports these, no need to know the endpoint details

import type { Product, Category, Review } from "./products.types";

const BASE_URL = "http://localhost:3000";

// GET /products  (optional filters)
export async function fetchProducts(params?: {
  id_kategorii?: number;
  minCena?: number;
  maxCena?: number;
}): Promise<Product[]> {
  const query = params
    ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : "";
  const res = await fetch(`${BASE_URL}/products${query ? "?" + query : ""}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// GET /products/:id
export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

// GET /products/:id/reviews
export async function fetchProductReviews(id: number): Promise<Review[]> {
  const res = await fetch(`${BASE_URL}/products/${id}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

// GET /categories
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// POST /products/:id/reviews
export async function addProductReview(id: number, data: { rating: number, comment: string }): Promise<Review> {
  const res = await fetch(`${BASE_URL}/products/${id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to add review");
  return res.json();
}

// POST /cart
export async function addToCart(id_przedmiotu: number, ilosc: number) {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_przedmiotu, ilosc })
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}
