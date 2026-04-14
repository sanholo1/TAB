import { Router } from "express";
import prisma from "../prisma/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const { dateFrom, dateTo, category } = req.query;
  const conditions: any[] = [];

  if (dateFrom || dateTo) {
    const dataFilter: any = {};
    if (dateFrom) dataFilter.gte = new Date(String(dateFrom));
    if (dateTo) {
      const dTo = new Date(String(dateTo));
      dTo.setHours(23, 59, 59, 999);
      dataFilter.lte = dTo;
    }
    conditions.push({ transakcja: { data: dataFilter } });
  }
  const categoryId = category && Number(category) > 0 ? Number(category) : undefined;
  if (categoryId) {
    conditions.push({ przedmiot: { id_kategorii: categoryId } });
  }

  try {
    const salesData = await prisma.przedmioty_transakcji.findMany({
      where: conditions.length > 0 ? { AND: conditions } : {},
      include: {
        transakcja: true,
        przedmiot: { include: { kategoria: true } },
      },
    });

    const productsWithReviews = await prisma.przedmioty.findMany({
      include: {
        opinie: true,
        kategoria: true,
      },
    });

    res.json({
      sales: salesData,
      reviews: productsWithReviews
    });
  } catch (error) {
    console.error("Prisma Error:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

export default router;