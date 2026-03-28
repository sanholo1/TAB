import { Router } from "express";
import * as ProductsController from "../controllers/products.controller.js";

const router = Router();

router.get("/", ProductsController.getAllProducts);
router.get("/:id", ProductsController.getProductById);
router.post("/", ProductsController.createProduct);
router.put("/:id", ProductsController.updateProduct);
router.delete("/:id", ProductsController.deleteProduct);


router.get("/:id/reviews", ProductsController.getProductReviews);
router.post("/:id/reviews", ProductsController.addProductReview);


router.put("/:id/promotion", ProductsController.setPromotion);

export default router;