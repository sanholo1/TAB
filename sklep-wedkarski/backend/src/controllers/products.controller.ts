import { Request, Response } from "express";
import * as ProductService from "../services/products.service.js";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const categoryId = req.query.category ? Number(req.query.category) : undefined;
        const minPrice = req.query.min_price ? Number(req.query.min_price) : undefined;
        const maxPrice = req.query.max_price ? Number(req.query.max_price) : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const price = typeof req.query.price === "string" ? req.query.price : undefined;

        const products = await ProductService.getAllProducts({
            categoryId,
            minPrice,
            maxPrice,
            search,
            price,
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.getProductById(Number(req.params.id));
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.createProduct(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.updateProduct(Number(req.params.id), req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.deleteProduct(Number(req.params.id));
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
};

export const setPromotion = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.setPromotion(Number(req.params.id), req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to set promotion" });
    }
};

export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await ProductService.getProductReviews(Number(req.params.id));
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

export const addProductReview = async (req: Request, res: Response) => {
  try {
        const rating = Number(req.body.rating ?? req.body.ocena);
        const comment = (req.body.comment ?? req.body.komentarz ?? "") as string;
    const userId = 1; // TODO: Zmienić userId 1 na req.user po dodaniu autoryzacji
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await ProductService.addProductReview(Number(req.params.id), userId, rating, comment);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to add review" });
  }
};
