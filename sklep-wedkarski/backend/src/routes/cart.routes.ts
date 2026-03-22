import { Router } from "express";
import * as CartController from "../controllers/cart.controller.js";

const router = Router();

router.get("/", CartController.getCart);
router.post("/", CartController.addToCart);

export default router;
