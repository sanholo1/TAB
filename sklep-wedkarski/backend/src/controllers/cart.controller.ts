import { Request, Response } from "express";
import * as CartService from "../services/cart.service.js";

// TODO: Zmienić userId 1 na req.user po dodaniu autoryzacji

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = 1; 
    const cart = await CartService.getCart(userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = 1; 
    const { id_przedmiotu, ilosc } = req.body;
    
    if (!id_przedmiotu || !ilosc || ilosc < 1) {
      return res.status(400).json({ error: "Invalid product ID or quantity" });
    }

    const item = await CartService.addToCart(userId, Number(id_przedmiotu), Number(ilosc));
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
};
