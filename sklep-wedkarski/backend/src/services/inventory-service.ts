import prisma from "../prisma/prisma.js";
import type { Prisma } from "@prisma/client";

export const getInventoryProducts = async () => {
  return prisma.przedmioty.findMany({
    include: { kategoria: true },
    orderBy: { id_przedmiotu: "desc" },
  });
};

export const getInventoryProductById = async (id: number) => {
  return prisma.przedmioty.findUnique({
    where: { id_przedmiotu: id },
    include: { kategoria: true },
  });
};

export const createInventoryProduct = async (data: Prisma.PrzedmiotyUncheckedCreateInput) => {
  return prisma.przedmioty.create({ data });
};

export const updateInventoryProduct = async (id: number, data: Prisma.PrzedmiotyUncheckedUpdateInput) => {
  return prisma.przedmioty.update({ where: { id_przedmiotu: id }, data });
};

export const softDeleteInventoryProduct = async (id: number) => {
  return prisma.przedmioty.update({ where: { id_przedmiotu: id }, data: { aktywny: false } });
};

export const setInventoryProductVisibility = async (id: number, aktywny: boolean) => {
  return prisma.przedmioty.update({ where: { id_przedmiotu: id }, data: { aktywny } });
};
