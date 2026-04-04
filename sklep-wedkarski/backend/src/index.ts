import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.js";
import inventoryRouter from "./routes/inventory.js";
import promotionsRouter from "./routes/promotions.js";
import categoriesRouter from "./routes/categories.js";
import cartRouter from "./routes/cart.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import uploadRouter from "./routes/upload.js";
import { errorHandler } from "./middleware/error-handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/products", productsRouter);
app.use("/inventory", inventoryRouter);
app.use("/promotions", promotionsRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/upload", uploadRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});