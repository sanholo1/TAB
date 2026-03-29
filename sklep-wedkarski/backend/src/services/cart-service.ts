import prisma from "../prisma/prisma.js";

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
