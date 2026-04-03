import prisma from "../prisma/prisma.js";
import { HttpError } from "../errors/http-error.js";

export const getCart = async (userId: number) => {
  return prisma.koszyk.findMany({
    where: { id_uzytkownika: userId },
    include: { przedmiot: true },
  });
};

export const addToCart = async (userId: number, id_przedmiotu: number, ilosc: number) => {
  const existingItem = await prisma.koszyk.findUnique({
    where: {
      id_przedmiotu_id_uzytkownika: { id_przedmiotu, id_uzytkownika: userId },
    },
  });

  if (existingItem) {
    const updated = await prisma.koszyk.update({
      where: {
        id_przedmiotu_id_uzytkownika: { id_przedmiotu, id_uzytkownika: userId },
      },
      data: { ilosc: existingItem.ilosc + ilosc },
    });
    return { item: updated, created: false };
  }

  const created = await prisma.koszyk.create({
    data: { id_uzytkownika: userId, id_przedmiotu, ilosc },
  });
  return { item: created, created: true };
};

export const removeFromCart = async (userId: number, id_przedmiotu: number) => {
  const existing = await prisma.koszyk.findUnique({
    where: {
      id_przedmiotu_id_uzytkownika: { id_przedmiotu, id_uzytkownika: userId },
    },
  });

  if (!existing) {
    throw new HttpError(404, "Product not found in cart");
  }

  return prisma.koszyk.delete({
    where: {
      id_przedmiotu_id_uzytkownika: { id_przedmiotu, id_uzytkownika: userId },
    },
  });
};

export const mergeCart = async (
  userId: number,
  items: Array<{ id_przedmiotu: number; ilosc: number }>,
) => {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const existing = await tx.koszyk.findUnique({
        where: {
          id_przedmiotu_id_uzytkownika: {
            id_przedmiotu: item.id_przedmiotu,
            id_uzytkownika: userId,
          },
        },
      });

      if (existing) {
        await tx.koszyk.update({
          where: {
            id_przedmiotu_id_uzytkownika: {
              id_przedmiotu: item.id_przedmiotu,
              id_uzytkownika: userId,
            },
          },
          data: { ilosc: existing.ilosc + item.ilosc },
        });
        continue;
      }

      await tx.koszyk.create({
        data: {
          id_uzytkownika: userId,
          id_przedmiotu: item.id_przedmiotu,
          ilosc: item.ilosc,
        },
      });
    }
  });

  return getCart(userId);
};
