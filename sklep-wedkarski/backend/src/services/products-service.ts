import prisma from "../prisma/prisma.js";
import type { Prisma } from "@prisma/client";
import type { GetAllProductsParams } from "../types/products.js";

export const getAllProducts = async ({ search, category, min_price, max_price, price, limit }: GetAllProductsParams) => {
  const where: Prisma.PrzedmiotyWhereInput = {
    aktywny: true,
    ilosc: { gt: 0 },
  };

  if (search) {
    where.nazwa = { contains: search };
  }

  if (category !== undefined) {
    where.id_kategorii = category;
  }

  if (min_price !== undefined || max_price !== undefined) { // <-- nowa wersja filtrowania po cenie
    where.AND = [];
    if (min_price !== undefined){
      where.AND.push(
        {OR: [ 
          {cena_prom: {gte: min_price}}, 
          {AND: [ {cena_prom: null},
                  {cena_sprzedazy: {gte: min_price}} ]}
        ]}
      )
    }
    if (max_price !== undefined){
      where.AND.push(
        {OR: [ 
          {cena_prom: {lte: max_price}}, 
          {AND: [ {cena_prom: null},
                  {cena_sprzedazy: {lte: max_price}} ]}
        ]}
      )
    }
  } else if (price) {
    if (price === "low") where.cena_sprzedazy = { lt: 50 };
    if (price === "mid") where.cena_sprzedazy = { gte: 50, lte: 200 };
    if (price === "high") where.cena_sprzedazy = { gt: 200 };
  }

  return prisma.przedmioty.findMany({
    where,
    include: { kategoria: true },
    orderBy: [{ id_przedmiotu: "asc" }],
    ...(limit ? { take: limit } : {})
  });
};

export const getProductById = async (id: number) => {
  return prisma.przedmioty.findUnique({ 
    where: { id_przedmiotu: id },
    include: { kategoria: true }
  });
};

export const getProductReviews = async (id: number) => {
  return prisma.opinia.findMany({ where: { id_przedmiotu: id } });
};

export const addProductReview = async (productId: number, userId: number, rating: number, comment: string) => {
  return prisma.opinia.create({
    data: { id_przedmiotu: productId, id_uzytkownika: userId, ocena: rating, komentarz: comment },
  });
};

export const getFeaturedProducts = async (limit: number = 5) => {
  return prisma.przedmioty.findMany({
    where: {
      aktywny: true,
      ilosc: { gt: 0 },
      cena_prom: { not: null }
    },
    include: { kategoria: true },
    take: limit,
    orderBy: { cena_sprzedazy: 'desc' }
  });
};
