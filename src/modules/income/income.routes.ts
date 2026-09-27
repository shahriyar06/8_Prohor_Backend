import { Router } from "express";
import { incomeController } from "./income.controller";
import { validate } from "@/middlewares/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  createIncomeSchema,
  updateIncomeSchema,
} from "./income.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";
import { requirePlanAccess } from "@/middlewares/planMiddleware";

const router = Router();
router.use(authenticate);

router.use(requirePlanAccess("income")); 

router.post("/categories", validate(createCategorySchema), asyncHandler(incomeController.createCategory));
router.get("/categories", asyncHandler(incomeController.listCategories));
router.patch("/categories/:categoryId", validate(updateCategorySchema), asyncHandler(incomeController.updateCategory));
router.delete("/categories/:categoryId", asyncHandler(incomeController.deleteCategory));

router.post("/", validate(createIncomeSchema), asyncHandler(incomeController.createIncome));
router.get("/", asyncHandler(incomeController.listIncomes));
router.get("/:incomeId", asyncHandler(incomeController.getIncomeById));
router.patch("/:incomeId", validate(updateIncomeSchema), asyncHandler(incomeController.updateIncome));
router.delete("/:incomeId", asyncHandler(incomeController.deleteIncome));

export default router;