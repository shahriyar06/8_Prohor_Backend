-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscription_plan" TEXT NOT NULL DEFAULT 'personal_basic',
ADD COLUMN     "trial_ends_at" TIMESTAMP(3);
