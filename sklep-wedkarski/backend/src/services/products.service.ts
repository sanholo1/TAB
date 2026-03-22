import { prisma } from "../prismaClient.js";

export const getAllProducts = async () => {
    return prisma.przedmioty.findMany();
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