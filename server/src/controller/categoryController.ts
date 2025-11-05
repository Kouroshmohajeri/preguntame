import { Request, Response } from "express";
import { CategoryRepository } from "../Repo/categoryRepo.js";

export const CategoryController = {
  async createCategory(req: Request, res: Response) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const existing = await CategoryRepository.getAllCategories();
      if (existing.find((cat) => cat.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ error: "Category already exists" });
      }

      const category = await CategoryRepository.createCategory({ name, description });
      return res.status(201).json(category);
    } catch (error) {
      console.error("❌ createCategory error:", error);
      return res.status(500).json({ error: "Failed to create category" });
    }
  },

  async listCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryRepository.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  },

  async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryRepository.getCategoryById(id);
      if (!category) return res.status(404).json({ error: "Category not found" });
      return res.status(200).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch category" });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const updated = await CategoryRepository.updateCategory(id, { name, description });
      if (!updated) return res.status(404).json({ error: "Category not found" });
      return res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update category" });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CategoryRepository.deleteCategory(id);
      return res.status(200).json({ message: "Category deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete category" });
    }
  },
};
