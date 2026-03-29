import { Router } from "express";
import { getAllCategories, getCategoryById } from "../services/categories-service.js";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await getAllCategories();
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  const category = await getCategoryById(Number(req.params.id));
  res.json(category);
});

export default router;
