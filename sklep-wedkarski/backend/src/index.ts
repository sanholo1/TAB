import "dotenv/config";
import cors from "cors";
import express from "express";

import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});