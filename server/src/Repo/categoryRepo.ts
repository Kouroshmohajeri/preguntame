import Category, { ICategory } from "../models/Category.js";

export const CategoryRepository = {
  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(data);
    await category.save();
    return category;
  },

  async getAllCategories(): Promise<ICategory[]> {
    return Category.find().sort({ createdAt: -1 });
  },

  async getCategoryById(id: string): Promise<ICategory | null> {
    return Category.findById(id);
  },

  async updateCategory(id: string, updates: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteCategory(id: string): Promise<void> {
    await Category.findByIdAndDelete(id);
  },
};
