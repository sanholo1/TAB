import "dotenv/config";
import cors from "cors";
import express from "express";
import prisma from "./prisma/prisma.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import cartRouter from "./routes/cart.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());


app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});