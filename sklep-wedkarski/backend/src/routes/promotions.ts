import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../validation/validate-request.js";
import {
  getPromotionsQuerySchema,
  bulkSetPromotionSchema,
  setPromotionSchema,
  productIdSchema,
} from "../validation/product-schemas.js";
import {
  getPromotionProducts,
  setPromotion,
  clearPromotion,
  bulkSetPromotions,
} from "../services/promotions-service.js";

const router = Router();

router.use(authenticate, authorize(2, 3));

router.get("/", async (req, res) => {
  const payload = validateRequest(getPromotionsQuerySchema, req.query);
  const promotions = await getPromotionProducts(payload);
  res.json(promotions);
});

router.post("/bulk", async (req, res) => {
  const payload = validateRequest(bulkSetPromotionSchema, req.body);
  const products = await bulkSetPromotions(payload.items);
  res.json(products);
});

router.put("/:id", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const payload = validateRequest(setPromotionSchema, req.body);

  const product = await setPromotion(id, payload);
  res.json(product);
});

router.delete("/:id", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const product = await clearPromotion(id);
  res.json(product);
});

export default router;