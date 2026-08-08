-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'volunteer', 'intern');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'inactive', 'suspended');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "address" TEXT,
ADD COLUMN     "member_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "prefix" TEXT;

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" TEXT NOT NULL,
    "organization_member_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "profile_photo" TEXT,
    "phone_number" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "blood_group" TEXT,
    "nationality" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "member_status" "MemberStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_organization_member_id_key" ON "member_profiles"("organization_member_id");

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_organization_member_id_fkey" FOREIGN KEY ("organization_member_id") REFERENCES "organization_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
