import { Prisma } from "@prisma/client";
import prisma from "../prisma/prisma.js";
import { HttpError } from "../errors/http-error.js";

type CartDbClient = Prisma.TransactionClient | typeof prisma;

const upsertCartItem = async (db: CartDbClient, userId: number, id_przedmiotu: number, ilosc: number) => {
  const product = await db.przedmioty.findUnique({
    where: { id_przedmiotu },
    select: {
      nazwa: true,
      aktywny: true,
      ilosc: true,
    },
  });

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  if (!product.aktywny) {
    throw new HttpError(409, `Product ${product.nazwa} is not available`);
  }

  if (product.ilosc <= 0) {
    throw new HttpError(409, `Product ${product.nazwa} is out of stock`);
  }

  const existingItem = await db.koszyk.findUnique({
    where: {
      id_przedmiotu_id_uzytkownika: { id_przedmiotu, id_uzytkownika: userId },
    },
  });

  const targetQuantity = (existingItem?.ilosc ?? 0) + ilosc;

  if (targetQuantity > product.ilosc) {
    throw new HttpError(
      409,
      `Insufficient stock for product ${product.nazwa}. Available: ${product.ilosc}, requested: ${targetQuantity}`,
    );
  }

  if (existingItem) {
    const updated = await db.koszyk.update({
      where: {
        id_przedmiotu_id_uzytkownika: { id_przedmiotu, id_uzytkownika: userId },
      },
      data: { ilosc: targetQuantity },
    });

    return { item: updated, created: false };
  }

  const created = await db.koszyk.create({
    data: { id_uzytkownika: userId, id_przedmiotu, ilosc },
  });

  return { item: created, created: true };
};

export const getCart = async (userId: number) => {
  return prisma.koszyk.findMany({
    where: { id_uzytkownika: userId },
    include: { przedmiot: true },
  });
};

export const addToCart = async (userId: number, id_przedmiotu: number, ilosc: number) => {
  return upsertCartItem(prisma, userId, id_przedmiotu, ilosc);
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
      await upsertCartItem(tx, userId, item.id_przedmiotu, item.ilosc);
    }
  });

  return getCart(userId);
};
