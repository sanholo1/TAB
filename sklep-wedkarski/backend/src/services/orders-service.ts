import { Prisma } from "@prisma/client";
import { HttpError } from "../errors/http-error.js";
import prisma from "../prisma/prisma.js";
import type { CreateGuestOrderSchema, CreateOrderSchema } from "../validation/order-schemas.js";

const defaultOrderStatus = "zlozone";
const guestAccountEmail = "gosc@sklep.pl";

type OrderProductSnapshot = {
  id_przedmiotu: number;
  nazwa: string;
  aktywny: boolean;
  ilosc: number;
  cena_sprzedazy: Prisma.Decimal;
  cena_prom: Prisma.Decimal | null;
};

type OrderItemInput = {
  id_przedmiotu: number;
  ilosc: number;
  przedmiot: OrderProductSnapshot;
};

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

const assertUserExists = async (tx: Prisma.TransactionClient, userId: number) => {
  const user = await tx.uzytkownik.findUnique({
    where: { id_uzytkownika: userId },
    select: {
      id_uzytkownika: true,
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }
};

const getGuestUserId = async (tx: Prisma.TransactionClient): Promise<number> => {
  const guestUser = await tx.uzytkownik.findFirst({
    where: {
      email: guestAccountEmail,
    },
    select: {
      id_uzytkownika: true,
    },
  });

  if (!guestUser) {
    throw new HttpError(500, "Guest account is not configured");
  }

  return guestUser.id_uzytkownika;
};

const normalizeOrderItems = (items: Array<{ id_przedmiotu: number; ilosc: number }>) => {
  const aggregatedItems = new Map<number, number>();

  for (const item of items) {
    const currentQuantity = aggregatedItems.get(item.id_przedmiotu) ?? 0;
    aggregatedItems.set(item.id_przedmiotu, currentQuantity + item.ilosc);
  }

  return Array.from(aggregatedItems, ([id_przedmiotu, ilosc]) => ({ id_przedmiotu, ilosc }));
};

const fetchOrderItemsFromPayload = async (
  tx: Prisma.TransactionClient,
  items: Array<{ id_przedmiotu: number; ilosc: number }>,
): Promise<OrderItemInput[]> => {
  const normalizedItems = normalizeOrderItems(items);
  const productIds = normalizedItems.map((item) => item.id_przedmiotu);

  const products = await tx.przedmioty.findMany({
    where: {
      id_przedmiotu: {
        in: productIds,
      },
    },
    select: {
      id_przedmiotu: true,
      nazwa: true,
      aktywny: true,
      ilosc: true,
      cena_sprzedazy: true,
      cena_prom: true,
    },
  });

  const productsById = new Map(products.map((product) => [product.id_przedmiotu, product]));

  return normalizedItems.map((item) => {
    const product = productsById.get(item.id_przedmiotu);

    if (!product) {
      throw new HttpError(404, `Product ${item.id_przedmiotu} not found`);
    }

    return {
      id_przedmiotu: item.id_przedmiotu,
      ilosc: item.ilosc,
      przedmiot: product,
    };
  });
};

const assertItemsAreAvailable = (items: OrderItemInput[]) => {
  for (const item of items) {
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
};

const createOrder = async (
  tx: Prisma.TransactionClient,
  userId: number,
  payload: CreateOrderSchema,
  items: OrderItemInput[],
  cartUserIdToClear?: number,
) => {
  const address = await tx.adres.create({
    data: {
      kraj: payload.kraj,
      miasto: payload.miasto,
      kod_pocztowy: payload.kod_pocztowy,
      ulica: payload.ulica,
      nr_domu: payload.nr_domu,
    },
  });

  const totalAmount = items.reduce((sum, item) => {
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

  for (const item of items) {
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

  if (cartUserIdToClear !== undefined) {
    await tx.koszyk.deleteMany({
      where: { id_uzytkownika: cartUserIdToClear },
    });
  }

  const createdOrder = await tx.transakcja.findUnique({
    where: { id_transakcji: transaction.id_transakcji },
    include: orderInclude,
  });

  if (!createdOrder) {
    throw new HttpError(500, "Failed to create order");
  }

  return createdOrder;
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
    await assertUserExists(tx, userId);

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

    assertItemsAreAvailable(cartItems);

    return createOrder(tx, userId, payload, cartItems, userId);
  });
};

export const createGuestOrder = async (payload: CreateGuestOrderSchema) => {
  return prisma.$transaction(async (tx) => {
    const guestUserId = await getGuestUserId(tx);
    const items = await fetchOrderItemsFromPayload(tx, payload.items);

    assertItemsAreAvailable(items);

    return createOrder(tx, guestUserId, payload, items);
  });
};
