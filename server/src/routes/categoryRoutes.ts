import express from "express";
import { CategoryController } from "../controller/categoryController.js";

const router = express.Router();

router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.listCategories);
router.get("/:id", CategoryController.getCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;
