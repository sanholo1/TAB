import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { HttpError } from "../errors/http-error.js";
import {
  createGuestOrder,
  createOrderFromCart,
  getOrdersByUserId,
  getOrderById,
  updateOrderStatus,
  getLastUserAddress,
} from "../services/orders-service.js";
import { createGuestOrderSchema, createOrderSchema } from "../validation/order-schemas.js";
import { validateRequest } from "../validation/validate-request.js";

const router = Router();


router.post("/guest", async (req, res) => {
  const payload = validateRequest(createGuestOrderSchema, req.body);
  const order = await createGuestOrder(payload);
  res.status(201).json(order);
});


router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new HttpError(400, "Invalid order ID");
  const order = await getOrderById(id);
  res.json(order);
});


router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new HttpError(400, "Invalid order ID");
  const statusSchema = z.object({ stan: z.string().min(1) });
  const { stan } = validateRequest(statusSchema, req.body);
  const order = await updateOrderStatus(id, stan);
  res.json(order);
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


router.get("/last-address", async (req, res) => {
  const userId = req.authUser!.userId;
  const address = await getLastUserAddress(userId);
  res.json({ address });
});

export default router;
