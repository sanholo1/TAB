import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, setPromotion, getProductReviews, addProductReview } from "../services/products-service.js";
import type { GetAllProductsParams } from "../types/products.js";

const router = Router();

router.get("/", async (req, res) => {
  const params: GetAllProductsParams = {};

  if (typeof req.query.search === "string") params.search = req.query.search;

  if (typeof req.query.category === "string") {
    const category = Number(req.query.category);
    if (!Number.isInteger(category) || category <= 0) {
      res.status(400).json({ error: "Invalid category value" });
      return;
    }
    params.category = category;
  }

  if (typeof req.query.min_price === "string") {
    const minPrice = Number(req.query.min_price);
    if (!Number.isFinite(minPrice)) {
      res.status(400).json({ error: "Invalid min_price value" });
      return;
    }
    params.min_price = minPrice;
  }

  if (typeof req.query.max_price === "string") {
    const maxPrice = Number(req.query.max_price);
    if (!Number.isFinite(maxPrice)) {
      res.status(400).json({ error: "Invalid max_price value" });
      return;
    }
    params.max_price = maxPrice;
  }

  if (typeof req.query.price === "string") params.price = req.query.price;

  const products = await getAllProducts(params);
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const product = await getProductById(id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

router.post("/", authenticate, async (req, res) => {
  const product = await createProduct(req.body);
  res.status(201).json(product);
});

router.put("/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const product = await updateProduct(id, req.body);
  res.json(product);
});

router.delete("/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  await deleteProduct(id);
  res.status(204).send();
});

router.put("/:id/promotion", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const product = await setPromotion(id, req.body);
  res.json(product);
});

router.get("/:id/reviews", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const reviews = await getProductReviews(id);
  res.json(reviews);
});

router.post("/:id/reviews", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const rating = Number(req.body.ocena ?? req.body.rating);
  const comment = (req.body.komentarz ?? req.body.comment ?? "") as string;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  const userId = req.authUser!.userId;

  const review = await addProductReview(id, userId, rating, comment);
  res.status(201).json(review);
});

export default router;
