
export interface Product {
  id_przedmiotu: number;
  nazwa: string;
  opis: string | null;
  cena_sprzedazy: number;
  cena_prom: number | null;
  ilosc: number;
  id_kategorii: number;
  kategoria?: Category;
}

export interface Category {
  id_kategorii: number;
  nazwa: string;
}

export interface Review {
  id_opinia: number;
  id_uzytkownika: number;
  id_przedmiotu: number;
  ocena: number; // 1-5
  komentarz: string | null;
}