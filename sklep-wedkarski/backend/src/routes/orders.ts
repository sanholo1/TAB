import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { createOrderFromCart } from "../services/orders-service.js";
import { createOrderSchema } from "../validation/order-schemas.js";
import { validateRequest } from "../validation/validate-request.js";

const router = Router();

router.use(authenticate);

router.post("/", async (req, res) => {
  const userId = req.authUser!.userId;
  const payload = validateRequest(createOrderSchema, req.body);
  const order = await createOrderFromCart(userId, payload);

  res.status(201).json(order);
});

export default router;