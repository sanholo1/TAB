import { Prisma } from "@prisma/client";
import { HttpError } from "../errors/http-error.js";
import prisma from "../prisma/prisma.js";
import type { CreateOrderSchema } from "../validation/order-schemas.js";

const defaultOrderStatus = "zlozone";
const guestAccountEmail = "gosc@sklep.pl";
const guestAccountUsername = "GoscNiezalogowany";

const orderInclude: Prisma.TransakcjaInclude = {
  adres: true,
  przedmioty: {
    include: {
      przedmiot: {
        select: {
          id_przedmiotu: true,
          nazwa: true,
        },
      },
    },
  },
};

const assertUserCanCreateOrder = async (tx: Prisma.TransactionClient, userId: number) => {
  const user = await tx.uzytkownik.findUnique({
    where: { id_uzytkownika: userId },
    select: {
      email: true,
      nazwa: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (user.email === guestAccountEmail || user.nazwa === guestAccountUsername) {
    throw new HttpError(403, "Guest account cannot place orders");
  }
};

export const getOrdersByUserId = async (userId: number) => {
  return prisma.transakcja.findMany({
    where: { id_uzytkownika: userId },
    include: orderInclude,
    orderBy: [{ data: "desc" }, { id_transakcji: "desc" }],
  });
};

export const createOrderFromCart = async (userId: number, payload: CreateOrderSchema) => {
  return prisma.$transaction(async (tx) => {
    await assertUserCanCreateOrder(tx, userId);

    const cartItems = await tx.koszyk.findMany({
      where: { id_uzytkownika: userId },
      include: {
        przedmiot: {
          select: {
            id_przedmiotu: true,
            nazwa: true,
            aktywny: true,
            ilosc: true,
            cena_sprzedazy: true,
            cena_prom: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new HttpError(400, "Cart is empty");
    }

    for (const item of cartItems) {
      if (!item.przedmiot.aktywny) {
        throw new HttpError(409, `Product ${item.przedmiot.nazwa} is not available`);
      }

      if (item.przedmiot.ilosc < item.ilosc) {
        throw new HttpError(
          409,
          `Insufficient stock for product ${item.przedmiot.nazwa}. Available: ${item.przedmiot.ilosc}, requested: ${item.ilosc}`,
        );
      }
    }

    const address = await tx.adres.create({
      data: {
        kraj: payload.kraj,
        miasto: payload.miasto,
        kod_pocztowy: payload.kod_pocztowy,
        ulica: payload.ulica,
        nr_domu: payload.nr_domu,
      },
    });

    const totalAmount = cartItems.reduce((sum, item) => {
      const unitPrice = item.przedmiot.cena_prom ?? item.przedmiot.cena_sprzedazy;
      return sum.plus(unitPrice.mul(item.ilosc));
    }, new Prisma.Decimal(0));

    const transaction = await tx.transakcja.create({
      data: {
        id_uzytkownika: userId,
        id_adres: address.id_adres,
        stan: defaultOrderStatus,
        kwota_calkowita: totalAmount,
        data: new Date().toISOString(),
      },
    });

    for (const item of cartItems) {
      const unitPrice = item.przedmiot.cena_prom ?? item.przedmiot.cena_sprzedazy;

      const stockUpdate = await tx.przedmioty.updateMany({
        where: {
          id_przedmiotu: item.id_przedmiotu,
          ilosc: { gte: item.ilosc },
          aktywny: true,
        },
        data: {
          ilosc: { decrement: item.ilosc },
        },
      });

      if (stockUpdate.count === 0) {
        throw new HttpError(409, `Insufficient stock for product ${item.przedmiot.nazwa}`);
      }

      await tx.przedmioty_transakcji.create({
        data: {
          id_transakcji: transaction.id_transakcji,
          id_przedmiotu: item.id_przedmiotu,
          liczba: item.ilosc,
          cena_przedmiotu: unitPrice,
        },
      });
    }

    await tx.koszyk.deleteMany({
      where: { id_uzytkownika: userId },
    });

    const createdOrder = await tx.transakcja.findUnique({
      where: { id_transakcji: transaction.id_transakcji },
      include: orderInclude,
    });

    if (!createdOrder) {
      throw new HttpError(500, "Failed to create order");
    }

    return createdOrder;
  });
};
