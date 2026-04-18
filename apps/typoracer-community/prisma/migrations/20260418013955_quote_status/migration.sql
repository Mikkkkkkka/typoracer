/*
  Warnings:

  - Added the required column `status` to the `quotes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "quote_status" AS ENUM ('SUBMITTED', 'APPROVED');

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "status" "quote_status" NOT NULL;
