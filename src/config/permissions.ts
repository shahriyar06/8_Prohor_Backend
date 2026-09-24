
export const PERMISSION_KEYS = {
  TASKS_VIEW: "tasks.view",
  TASKS_CREATE: "tasks.create",
  TASKS_EDIT: "tasks.edit",
  TASKS_DELETE: "tasks.delete",

  INCOME_VIEW: "income.view",
  INCOME_CREATE: "income.create",
  INCOME_EDIT: "income.edit",
  INCOME_DELETE: "income.delete",

  EXPENSE_VIEW: "expense.view",
  EXPENSE_CREATE: "expense.create",
  EXPENSE_EDIT: "expense.edit",
  EXPENSE_DELETE: "expense.delete",

  LIABILITY_VIEW: "liability.view",
  LIABILITY_MANAGE: "liability.manage",

  RECEIVABLE_VIEW: "receivable.view",
  RECEIVABLE_MANAGE: "receivable.manage",

  MEMBERS_VIEW: "members.view",
  MEMBERS_MANAGE: "members.manage",
} as const;

export const PERMISSION_GROUPS = [
  { label: "Tasks", keys: [PERMISSION_KEYS.TASKS_VIEW, PERMISSION_KEYS.TASKS_CREATE, PERMISSION_KEYS.TASKS_EDIT, PERMISSION_KEYS.TASKS_DELETE] },
  { label: "Income", keys: [PERMISSION_KEYS.INCOME_VIEW, PERMISSION_KEYS.INCOME_CREATE, PERMISSION_KEYS.INCOME_EDIT, PERMISSION_KEYS.INCOME_DELETE] },
  { label: "Expense", keys: [PERMISSION_KEYS.EXPENSE_VIEW, PERMISSION_KEYS.EXPENSE_CREATE, PERMISSION_KEYS.EXPENSE_EDIT, PERMISSION_KEYS.EXPENSE_DELETE] },
  { label: "Liability", keys: [PERMISSION_KEYS.LIABILITY_VIEW, PERMISSION_KEYS.LIABILITY_MANAGE] },
  { label: "Receivable", keys: [PERMISSION_KEYS.RECEIVABLE_VIEW, PERMISSION_KEYS.RECEIVABLE_MANAGE] },
  { label: "Members", keys: [PERMISSION_KEYS.MEMBERS_VIEW, PERMISSION_KEYS.MEMBERS_MANAGE] },
];