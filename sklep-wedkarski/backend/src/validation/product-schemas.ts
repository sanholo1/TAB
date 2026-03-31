import { z } from "zod";

export const createProductSchema = z.object({
  nazwa: z.string().min(3, "Name must be at least 3 characters long").max(200, "Name is too long"),
  opis: z.string().optional(),
  cena_sprzedazy: z.number().positive("Selling price must be positive"),
  cena_zakupu: z.number().positive("Purchase price must be positive"),
  cena_prom: z.number().nullable().optional(),
  ilosc: z.number().int().min(0, "Quantity must be non-negative"),
  id_kategorii: z.number().int().positive("Invalid category ID"),
});

export const updateProductSchema = z.object({
  nazwa: z.string().min(3, "Name must be at least 3 characters long").max(200, "Name is too long").optional(),
  opis: z.string().optional(),
  cena_sprzedazy: z.number().positive("Selling price must be positive").optional(),
  cena_zakupu: z.number().positive("Purchase price must be positive").optional(),
  cena_prom: z.number().nullable().optional(),
  ilosc: z.number().int().min(0, "Quantity must be non-negative").optional(),
  id_kategorii: z.number().int().positive("Invalid category ID").optional(),
});

export const setPromotionSchema = z.object({
  cena_prom: z.number().positive("Promotional price must be positive").nullable(),
});

export const updateStockSchema = z.object({
  ilosc: z.number().int().min(0, "Quantity must be non-negative"),
});

export const addReviewSchema = z.object({
  ocena: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating can be at most 5").optional(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating can be at most 5").optional(),
  komentarz: z.string().optional(),
  comment: z.string().optional(),
}).refine((data) => data.ocena !== undefined || data.rating !== undefined, {
  message: "No rating provided",
});

export const productIdSchema = z.object({
  id: z.coerce.number().int().positive("Invalid product ID"),
});

export const getProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.coerce.number().int().positive().optional(),
  min_price: z.coerce.number().nonnegative().optional(),
  max_price: z.coerce.number().nonnegative().optional(),
  price: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
