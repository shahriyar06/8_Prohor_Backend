export const PLAN_CONFIGS: Record<string, { name: string; routes: string[] }> =
  {
    personal_basic: {
      name: "Basic",
      routes: [
        "dashboard",
        "tasks",
        "stopwatch",
        "settings.account",
        "settings.appearance",
        "settings.profile",
      ],
    },
    personal_pro: {
      name: "Pro",
      routes: [
        "dashboard",
        "tasks",
        "stopwatch",
        "settings.account",
        "settings.appearance",
        "settings.profile",
        "income-category",
        "income",
        "expense-category",
        "expense",
        "liability",
        "receivable",
        "reports",
      ],
    },
    organization_basic: {
      name: "Basic",
      routes: [
        "dashboard",
        "tasks",
        "stopwatch",
        "settings.account",
        "settings.organization",
        "settings.appearance",
        "settings.profile",
        "permissions",
        "user-management",
      ],
    },
    organization_pro: {
      name: "Pro",
      routes: [
        "dashboard",
        "tasks",
        "stopwatch",
        "settings.account",
        "settings.organization",
        "settings.appearance",
        "settings.profile",
        "permissions",
        "user-management",
        "income-category",
        "income",
        "expense-category",
        "expense",
        "liability",
        "receivable",
        "reports",
      ],
    },
  };

export function getEffectivePlan(
  accountType: "personal" | "organization",
  subscriptionPlan: string,
  trialEndsAt: Date | null,
): string {
  const isTrialActive = !!trialEndsAt && trialEndsAt > new Date();
  if (isTrialActive)
    return accountType === "organization" ? "organization_pro" : "personal_pro";
  return subscriptionPlan;
}
