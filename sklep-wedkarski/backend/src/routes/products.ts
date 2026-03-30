import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../validation/validate-request.js";
import { createProductSchema, updateProductSchema, setPromotionSchema, updateStockSchema, addReviewSchema, productIdSchema, getProductsQuerySchema } from "../validation/product-schemas.js";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, setPromotion, getProductReviews, addProductReview } from "../services/products-service.js";

const router = Router();

router.get("/", async (req, res) => {
  const payload = validateRequest(getProductsQuerySchema, req.query);
  const products = await getAllProducts(payload as any);
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  const product = await getProductById(id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

router.post("/", authenticate, authorize(2, 3), async (req, res) => {
  const payload = validateRequest(createProductSchema, req.body);
  const product = await createProduct(payload as any);
  res.status(201).json(product);
});

router.put("/:id", authenticate, authorize(2, 3), async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const payload = validateRequest(updateProductSchema, req.body);
  
  const product = await updateProduct(id, payload as any);
  res.json(product);
});

router.delete("/:id", authenticate, authorize(3), async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  await deleteProduct(id);
  res.status(204).send();
});

router.put("/:id/promotion", authenticate, authorize(2, 3), async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  const payload = validateRequest(setPromotionSchema, req.body);
  const product = await setPromotion(id, payload);
  res.json(product);
});

router.patch("/:id/stock", authenticate, authorize(2, 3), async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  const payload = validateRequest(updateStockSchema, req.body);
  const product = await updateProduct(id, payload);
  res.json(product);
});

router.get("/:id/reviews", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  const reviews = await getProductReviews(id);
  res.json(reviews);
});

router.post("/:id/reviews", authenticate, async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  const payload = validateRequest(addReviewSchema, req.body);
  
  const rating = Number(payload.ocena ?? payload.rating);
  const comment = (payload.komentarz ?? payload.comment ?? "") as string;

  const userId = req.authUser!.userId;

  const review = await addProductReview(id, userId, rating, comment);
  res.status(201).json(review);
});

export default router;
