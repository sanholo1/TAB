import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { HttpError } from "../errors/http-error.js";
import { validateRequest } from "../validation/validate-request.js";
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  setProductVisibilitySchema,
  productIdSchema,
} from "../validation/product-schemas.js";
import {
  getInventoryProducts,
  createInventoryProduct,
  updateInventoryProduct,
  softDeleteInventoryProduct,
  setInventoryProductVisibility,
  getInventoryProductById,
} from "../services/inventory-service.js";

const router = Router();

router.use(authenticate, authorize(2, 3));

router.get("/products", async (_req, res) => {
  const products = await getInventoryProducts();
  res.json(products);
});

router.post("/products", async (req, res) => {
  const payload = validateRequest(createProductSchema, req.body);
  const product = await createInventoryProduct(payload as any);
  res.status(201).json(product);
});

router.put("/products/:id", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const payload = validateRequest(updateProductSchema, req.body);

  const product = await updateInventoryProduct(id, payload as any);
  res.json(product);
});

router.delete("/products/:id", authorize(3), async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);

  await softDeleteInventoryProduct(id);
  res.status(204).send();
});

router.patch("/products/:id/stock", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const payload = validateRequest(updateStockSchema, req.body);

  const product = await updateInventoryProduct(id, payload);
  res.json(product);
});

router.patch("/products/:id/visibility", authorize(3), async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const payload = validateRequest(setProductVisibilitySchema, req.body);

  const product = await setInventoryProductVisibility(id, payload.aktywny);
  res.json(product);
});

router.get("/products/:id", async (req, res) => {
  const { id } = validateRequest(productIdSchema, req.params);
  const product = await getInventoryProductById(id);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  res.json(product);
});

export default router;