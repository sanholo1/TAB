import { prisma } from "../prismaClient.js";

type GetAllProductsParams = {
    categoryId: number | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    search: string | undefined;
    price: string | undefined;
};

export const getAllProducts = async ({ categoryId, minPrice, maxPrice, search, price }: GetAllProductsParams) => {
    const where: any = {};

    if (search) {
        where.nazwa = {
            contains: search,
        };
    }

    if (categoryId !== undefined) {
        where.id_kategorii = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.cena_sprzedazy = {};
        if (minPrice !== undefined) where.cena_sprzedazy.gte = minPrice;
        if (maxPrice !== undefined) where.cena_sprzedazy.lte = maxPrice;
    } else if (price) {
        if (price === "low") where.cena_sprzedazy = { lt: 50 };
        if (price === "mid") where.cena_sprzedazy = { gte: 50, lte: 200 };
        if (price === "high") where.cena_sprzedazy = { gt: 200 };
    }

    return prisma.przedmioty.findMany({ where });
};

export const getProductById = async (id: number) => {
    return prisma.przedmioty.findUnique({ where: { id_przedmiotu: id } });
};

export const createProduct = async (product: any) => {
    return prisma.przedmioty.create({ data: product });
};

export const updateProduct = async (id: number, product: any) => {
    return prisma.przedmioty.update({ where: { id_przedmiotu: id }, data: product });
};

export const deleteProduct = async (id: number) => {
    return prisma.przedmioty.delete({ where: { id_przedmiotu: id } });
};

export const setPromotion = async (id: number, promotion: any) => {
    return prisma.przedmioty.update({ where: { id_przedmiotu: id }, data: promotion });
};

export const getProductReviews = async (id: number) => {
    return prisma.opinia.findMany({ where: { id_przedmiotu: id } });
};

export const addProductReview = async (productId: number, userId: number, rating: number, comment: string) => {
  return prisma.opinia.create({
    data: {
      id_przedmiotu: productId,
      id_uzytkownika: userId, // Tymczasowo mockowane na poziomie kontrolera
      ocena: rating,
      komentarz: comment
    }
  });
};  