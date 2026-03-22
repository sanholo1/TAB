import { prisma } from "../prismaClient.js";

export const addToCart = async (userId: number, productId: number, quantity: number) => {
  const existingItem = await prisma.koszyk.findUnique({
    where: {
      id_przedmiotu_id_uzytkownika: {
        id_przedmiotu: productId,
        id_uzytkownika: userId,
      }
    }
  });

  if (existingItem) {
    return prisma.koszyk.update({
      where: {
        id_przedmiotu_id_uzytkownika: {
          id_przedmiotu: productId,
          id_uzytkownika: userId,
        }
      },
      data: {
        ilosc: existingItem.ilosc + quantity
      }
    });
  }

  return prisma.koszyk.create({
    data: {
      id_uzytkownika: userId,
      id_przedmiotu: productId,
      ilosc: quantity
    }
  });
};

export const getCart = async (userId: number) => {
  return prisma.koszyk.findMany({
    where: { id_uzytkownika: userId },
    include: { przedmiot: true } // żeby pobrać nazwę i cenę przedmiotu na froncie
  });
};
