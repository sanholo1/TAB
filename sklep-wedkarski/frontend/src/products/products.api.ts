import type { Product, Category, Review } from "./products.types";

const BASE_URL = "http://localhost:3000";

 
export async function fetchProducts(params?: {
  search?: string;
  category?: number;
  price?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
}): Promise<Product[]> {
  const queryParams: any = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.category !== undefined) queryParams.category = String(params.category);
  if (params?.price) queryParams.price = params.price;
  if (params?.min_price !== undefined) queryParams.min_price = String(params.min_price);
  if (params?.max_price !== undefined) queryParams.max_price = String(params.max_price);
  if (params?.limit !== undefined) queryParams.limit = String(params.limit);

  const query = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${BASE_URL}/products${query ? "?" + query : ""}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}


export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}


export async function fetchProductReviews(id: number): Promise<Review[]> {
  const res = await fetch(`${BASE_URL}/products/${id}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}


export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}


export async function addProductReview(id: number, data: { rating: number, comment: string }): Promise<Review> {
  const res = await fetch(`${BASE_URL}/products/${id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ocena: data.rating,
      komentarz: data.comment
    })
  });
  if (!res.ok) throw new Error("Failed to add review");
  return res.json();
}


export async function addToCart(id_przedmiotu: number, ilosc: number) {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_przedmiotu, ilosc })
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}
