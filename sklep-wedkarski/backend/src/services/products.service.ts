import { prisma } from "../prismaClient.js";

export const getAllProducts = async (id_category?: number, min_price?: number, max_price?: number) => {
    const where: any = {};

    if (id_category !== undefined) {
        where.id_kategorii = id_category;
    }

    if (min_price !== undefined || max_price !== undefined) {
        where.cena_sprzedazy = {};
        if (min_price !== undefined) where.cena_sprzedazy.gte = min_price;
        if (max_price !== undefined) where.cena_sprzedazy.lte = max_price;
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