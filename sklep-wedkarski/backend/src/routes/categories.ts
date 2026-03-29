import { Router } from "express";
import { getAllCategories, getCategoryById } from "../services/categories-service.js";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await getAllCategories();
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid category id" });
    return;
  }

  const category = await getCategoryById(id);
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json(category);
});

export default router;
