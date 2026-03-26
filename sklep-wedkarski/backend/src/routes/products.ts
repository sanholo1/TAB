import { Router } from "express";
import prisma from "../prisma/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const { search, category, price } = req.query;

  const where: any = {};

  if (search) {
    where.nazwa = {
      contains: String(search),
    };
  }

  if (category) {
    where.id_kategorii = Number(category);
  }

  if (price) {
    if (price === "low") where.cena_sprzedazy = { lt: 50 };
    if (price === "mid") where.cena_sprzedazy = { gte: 50, lte: 200 };
    if (price === "high") where.cena_sprzedazy = { gt: 200 };
  }

  const products = await prisma.przedmioty.findMany({ where });

  res.json(products);
});

export default router;