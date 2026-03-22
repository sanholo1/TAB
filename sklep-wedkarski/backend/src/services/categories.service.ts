import { prisma } from "../prismaClient.js";

export const getAllCategories = async () => {
    return prisma.kategoria.findMany();
};

export const getCategoryById = async (id: number) => {
    return prisma.kategoria.findUnique({ where: { id_kategorii: id } });
};