import { Router } from "express";
import prisma from "../prisma/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await prisma.kategoria.findMany();
  res.json(categories);
});

export default router;