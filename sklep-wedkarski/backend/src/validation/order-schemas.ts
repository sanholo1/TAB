import { z } from "zod";
import { addToCartSchema } from "./cart-schemas.js";

const orderAddressSchema = z.object({
  kraj: z.string().trim().min(2, "Country is required").max(191, "Country is too long"),
  miasto: z.string().trim().min(2, "City is required").max(191, "City is too long"),
  kod_pocztowy: z.string().trim().min(2, "Postal code is required").max(191, "Postal code is too long"),
  ulica: z.string().trim().min(2, "Street is required").max(191, "Street is too long"),
  nr_domu: z.string().trim().min(1, "House number is required").max(191, "House number is too long"),
});

export const createOrderSchema = orderAddressSchema;

export const createGuestOrderSchema = orderAddressSchema.extend({
  items: z.array(addToCartSchema).min(1, "Cart items are required"),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type CreateGuestOrderSchema = z.infer<typeof createGuestOrderSchema>;
