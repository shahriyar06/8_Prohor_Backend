import { Router } from "express";
import { expenseController } from "./expense.controller";
import { validate } from "@/middlewares/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  createExpenseSchema,
  updateExpenseSchema,
} from "./expense.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";
import { requirePlanAccess } from "@/middlewares/planMiddleware";

const router = Router();
router.use(authenticate);

router.use(requirePlanAccess("expense"));

router.post(
  "/categories",
  validate(createCategorySchema),
  asyncHandler(expenseController.createCategory),
);
router.get("/categories", asyncHandler(expenseController.listCategories));
router.patch(
  "/categories/:categoryId",
  validate(updateCategorySchema),
  asyncHandler(expenseController.updateCategory),
);
router.delete(
  "/categories/:categoryId",
  asyncHandler(expenseController.deleteCategory),
);

router.post(
  "/",
  validate(createExpenseSchema),
  asyncHandler(expenseController.createExpense),
);
router.get("/", asyncHandler(expenseController.listExpenses));
router.get("/summary", asyncHandler(expenseController.summary));
router.get("/:expenseId", asyncHandler(expenseController.getExpenseById));
router.patch(
  "/:expenseId",
  validate(updateExpenseSchema),
  asyncHandler(expenseController.updateExpense),
);
router.delete("/:expenseId", asyncHandler(expenseController.deleteExpense));

export default router;
