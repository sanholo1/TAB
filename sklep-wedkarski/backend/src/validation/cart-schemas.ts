import { z } from "zod";

export const cartItemParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid product ID"),
});

export const addToCartSchema = z.object({
  id_przedmiotu: z.coerce.number().int().positive("Invalid product ID"),
  ilosc: z.coerce.number().int().positive("Quantity must be positive"),
});
