/*
  Warnings:

  - The `sleepHabit` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cleanliness` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `smoking` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `drinking` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pets` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `socialVibe` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PreferenceLevel" AS ENUM ('NO', 'SOMETIMES', 'YES');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "sleepHabit",
ADD COLUMN     "sleepHabit" "PreferenceLevel" NOT NULL DEFAULT 'SOMETIMES',
DROP COLUMN "cleanliness",
ADD COLUMN     "cleanliness" "PreferenceLevel" NOT NULL DEFAULT 'SOMETIMES',
DROP COLUMN "smoking",
ADD COLUMN     "smoking" "PreferenceLevel" NOT NULL DEFAULT 'SOMETIMES',
DROP COLUMN "drinking",
ADD COLUMN     "drinking" "PreferenceLevel" NOT NULL DEFAULT 'SOMETIMES',
DROP COLUMN "pets",
ADD COLUMN     "pets" "PreferenceLevel" NOT NULL DEFAULT 'SOMETIMES',
DROP COLUMN "socialVibe",
ADD COLUMN     "socialVibe" "PreferenceLevel" NOT NULL DEFAULT 'SOMETIMES';

-- DropEnum
DROP TYPE "Level";

-- DropEnum
DROP TYPE "SleepHabit";

-- DropEnum
DROP TYPE "SocialVibe";
