import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { HttpError } from "../errors/http-error.js";
import { validateRequest } from "../validation/validate-request.js";
import { addReviewSchema, productIdSchema, getProductsQuerySchema, getFeaturedProductsQuerySchema } from "../validation/product-schemas.js";
import { getAllProducts, getProductById, getProductReviews, addProductReview, getFeaturedProducts } from "../services/products-service.js";

const router = Router();

router.get("/", async (req, res) => {
  const payload = validateRequest(getProductsQuerySchema, req.query);
  const products = await getAllProducts(payload as any);
  res.json(products);
});

router.get("/featured", async (req, res) => {
  const payload = validateRequest(getFeaturedProductsQuerySchema, req.query);
  const limit = payload.limit ?? 5;
  const products = await getFeaturedProducts(limit);
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  const product = await getProductById(id);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

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
