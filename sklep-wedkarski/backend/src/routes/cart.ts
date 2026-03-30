import { Router, Request } from "express";
import { verifyAuthToken } from "../lib/jwt.js";
import { getCart, addToCart, removeFromCart } from "../services/cart-service.js";
import { validateRequest } from "../validation/validate-request.js";
import { addToCartSchema, cartItemParamSchema } from "../validation/cart-schemas.js";

const router = Router();

const GUEST_USER_ID = 1;

const getUserIdFromRequest = (req: Request): number => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return GUEST_USER_ID;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return GUEST_USER_ID;
    }

    const payload = verifyAuthToken(token);
    return payload.userId;
  } catch (error) {
    return GUEST_USER_ID;
  }
};

router.get("/", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const cart = await getCart(userId);
  res.json(cart);
});

router.post("/", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const payload = validateRequest(addToCartSchema, req.body);
  
  const { item, created } = await addToCart(userId, payload.id_przedmiotu, payload.ilosc);
  res.status(created ? 201 : 200).json(item);
});

router.delete("/:id", async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const { id } = validateRequest(cartItemParamSchema, req.params);

  await removeFromCart(userId, id);
  res.status(204).send();
});

export default router;
