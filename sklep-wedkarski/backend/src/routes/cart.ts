import { Router, Request } from "express";
import { verifyAuthToken } from "../lib/jwt.js";
import { getCart, addToCart } from "../services/cart-service.js";

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
  const { id_przedmiotu, ilosc } = req.body;

  if (!id_przedmiotu || !ilosc || ilosc < 1) {
    res.status(400).json({ error: "Nieprawidłowe ID przedmiotu lub ilość" });
    return;
  }

  const { item, created } = await addToCart(userId, Number(id_przedmiotu), Number(ilosc));
  res.status(created ? 201 : 200).json(item);
});

export default router;
