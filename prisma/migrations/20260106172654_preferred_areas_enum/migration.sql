/*
  Warnings:

  - The `preferredAreas` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Areas" AS ENUM ('Delhi', 'Gurugram', 'Noida', 'Greater_Noida');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "preferredAreas",
ADD COLUMN     "preferredAreas" "Areas"[];
