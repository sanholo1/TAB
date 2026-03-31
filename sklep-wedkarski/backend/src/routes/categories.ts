import { Router } from "express";
import { getAllCategories, getCategoryById } from "../services/categories-service.js";

import { validateRequest } from "../validation/validate-request.js";
import { categoryIdSchema } from "../validation/category-schemas.js";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await getAllCategories();
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  const { id } = validateRequest(categoryIdSchema, req.params);

  const category = await getCategoryById(id);
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json(category);
});

export default router;
