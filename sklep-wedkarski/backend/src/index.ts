import "dotenv/config";
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      db: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  res.json(products);
});

app.post("/products", async (req, res) => {
  const { name, description, price, sku, categoryId, quantity } = req.body ?? {};

  if (typeof name !== "string" || typeof price !== "number") {
    return res.status(400).json({
      error: "Fields 'name' (string) and 'price' (number) are required.",
    });
  }

  const normalizedSku =
    typeof sku === "string" && sku.trim().length > 0
      ? sku.trim()
      : `SKU-${Date.now()}`;

  const defaultCategory = await prisma.category.upsert({
    where: { name: "Bez kategorii" },
    update: {},
    create: { name: "Bez kategorii" },
  });

  const product = await prisma.product.create({
    data: {
      name,
      description: typeof description === "string" ? description : null,
      price,
      sku: normalizedSku,
      quantity: typeof quantity === "number" ? quantity : 0,
      categoryId: typeof categoryId === "number" ? categoryId : defaultCategory.id,
    },
  });

  return res.status(201).json(product);
});

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
