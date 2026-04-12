import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { createGuestOrder, createOrderFromCart, getOrdersByUserId } from "../services/orders-service.js";
import { createGuestOrderSchema, createOrderSchema } from "../validation/order-schemas.js";
import { validateRequest } from "../validation/validate-request.js";

const router = Router();

router.post("/guest", async (req, res) => {
  const payload = validateRequest(createGuestOrderSchema, req.body);
  const order = await createGuestOrder(payload);

  res.status(201).json(order);
});

router.use(authenticate);

router.get("/", async (req, res) => {
  const userId = req.authUser!.userId;
  const orders = await getOrdersByUserId(userId);

  res.json(orders);
});

router.post("/", async (req, res) => {
  const userId = req.authUser!.userId;
  const payload = validateRequest(createOrderSchema, req.body);
  const order = await createOrderFromCart(userId, payload);

  res.status(201).json(order);
});

export default router;
