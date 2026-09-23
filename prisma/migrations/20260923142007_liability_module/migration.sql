-- CreateEnum
CREATE TYPE "LiabilityStatus" AS ENUM ('pending', 'partial', 'paid');

-- CreateTable
CREATE TABLE "liabilities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_by_name" TEXT NOT NULL,
    "organization_id" TEXT,
    "person_name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "reason" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "LiabilityStatus" NOT NULL DEFAULT 'pending',
    "remind_before_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liabilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
