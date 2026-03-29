import "dotenv/config";
import cors from "cors";
import express from "express";

import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
