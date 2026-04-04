import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getCart, addToCart, removeFromCart, mergeCart } from "../services/cart-service.js";
import { validateRequest } from "../validation/validate-request.js";
import { addToCartSchema, cartItemParamSchema, mergeCartSchema } from "../validation/cart-schemas.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  const userId = req.authUser!.userId;
  const cart = await getCart(userId);
  res.json(cart);
});

router.post("/", async (req, res) => {
  const userId = req.authUser!.userId;
  const payload = validateRequest(addToCartSchema, req.body);
  
  const { item, created } = await addToCart(userId, payload.id_przedmiotu, payload.ilosc);
  res.status(created ? 201 : 200).json(item);
});

router.post("/merge", async (req, res) => {
  const userId = req.authUser!.userId;
  const payload = validateRequest(mergeCartSchema, req.body);

  const cart = await mergeCart(userId, payload.items);
  res.status(200).json(cart);
});

router.delete("/:id", async (req, res) => {
  const userId = req.authUser!.userId;
  const { id } = validateRequest(cartItemParamSchema, req.params);

  await removeFromCart(userId, id);
  res.status(204).send();
});

export default router;
