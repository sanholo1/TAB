import type { Product } from "../products/products.types";

export type InventoryProductPayload = {
  nazwa: string;
  opis?: string;
  cena_sprzedazy: number;
  cena_zakupu: number;
  cena_prom?: number | null;
  ilosc: number;
  id_kategorii: number;
  zdjecie_url?: string | null;
};

export type InventoryProduct = Product & {
  aktywny: boolean;
};
