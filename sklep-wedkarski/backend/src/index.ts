import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./prismaClient.js";
import productsRouter from "./routes/products.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import cartRouter from "./routes/cart.routes.js";     
const app = express();  
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

app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);



app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
