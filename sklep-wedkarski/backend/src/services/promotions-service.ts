import prisma from "../prisma/prisma.js";
import type { Prisma } from "@prisma/client";

export const getPromotionProducts = async ({
  search,
  category,
  status,
  limit,
}: {
  search?: string | undefined;
  category?: number | undefined;
  status?: "active" | "inactive" | "all" | undefined;
  limit?: number | undefined;
}) => {
  const where: Prisma.PrzedmiotyWhereInput = { aktywny: true };

  if (search) {
    where.nazwa = { contains: search };
  }

  if (category !== undefined) {
    where.id_kategorii = category;
  }

  if (status === "active") {
    where.cena_prom = { not: null };
  }

  if (status === "inactive") {
    where.cena_prom = null;
  }

  return prisma.przedmioty.findMany({
    where,
    include: { kategoria: true },
    ...(limit ? { take: limit } : {}),
    orderBy: { id_przedmiotu: "desc" },
  });
};

export const setPromotion = async (id: number, data: Prisma.PrzedmiotyUpdateInput) => {
  return prisma.przedmioty.update({ where: { id_przedmiotu: id }, data });
};

export const clearPromotion = async (id: number) => {
  return prisma.przedmioty.update({
    where: { id_przedmiotu: id },
    data: { cena_prom: null },
  });
};

export const bulkSetPromotions = async (
  items: Array<{ id_przedmiotu: number; cena_prom: number | null }>,
) => {
  await prisma.$transaction(
    items.map((item) =>
      prisma.przedmioty.update({
        where: { id_przedmiotu: item.id_przedmiotu },
        data: { cena_prom: item.cena_prom },
      }),
    ),
  );

  return prisma.przedmioty.findMany({
    where: {
      id_przedmiotu: {
        in: items.map((item) => item.id_przedmiotu),
      },
    },
    include: { kategoria: true },
    orderBy: { id_przedmiotu: "asc" },
  });
};
