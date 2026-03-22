import { Request, Response } from "express";
import * as CategoryService from "../services/categories.service.js";

export const getAllCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await CategoryService.getCategoryById(Number(req.params.id));
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch category" });
    }
};