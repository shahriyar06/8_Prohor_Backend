/*
  Warnings:

  - You are about to drop the column `token_hash` on the `email_verification_tokens` table. All the data in the column will be lost.
  - Added the required column `otp_hash` to the `email_verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_verification_tokens" DROP COLUMN "token_hash",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otp_hash" TEXT NOT NULL;
