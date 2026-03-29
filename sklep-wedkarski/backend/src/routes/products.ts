import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, setPromotion, getProductReviews, addProductReview } from "../services/products-service.js";
import type { GetAllProductsParams } from "../types/products.js";

const router = Router();

router.get("/", async (req, res) => {
  const params: GetAllProductsParams = {};
  if (typeof req.query.search === "string") params.search = req.query.search;
  if (req.query.category) params.category = Number(req.query.category);
  if (req.query.min_price) params.min_price = Number(req.query.min_price);
  if (req.query.max_price) params.max_price = Number(req.query.max_price);
  if (typeof req.query.price === "string") params.price = req.query.price;

  const products = await getAllProducts(params);
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await getProductById(Number(req.params.id));
  res.json(product);
});

router.post("/", async (req, res) => {
  const product = await createProduct(req.body);
  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const product = await updateProduct(Number(req.params.id), req.body);
  res.json(product);
});

router.delete("/:id", async (req, res) => {
  await deleteProduct(Number(req.params.id));
  res.status(204).send();
});

router.put("/:id/promotion", async (req, res) => {
  const product = await setPromotion(Number(req.params.id), req.body);
  res.json(product);
});

router.get("/:id/reviews", async (req, res) => {
  const reviews = await getProductReviews(Number(req.params.id));
  res.json(reviews);
});

router.post("/:id/reviews", authenticate, async (req, res) => {
  const rating = Number(req.body.ocena ?? req.body.rating);
  const comment = (req.body.komentarz ?? req.body.comment ?? "") as string;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  const userId = req.authUser!.userId;

  const review = await addProductReview(Number(req.params.id), userId, rating, comment);
  res.status(201).json(review);
});

export default router;
