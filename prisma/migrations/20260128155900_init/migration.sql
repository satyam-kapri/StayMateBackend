-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('RADIO', 'MULTI_SELECT', 'TEXT', 'NUMBER', 'DATE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('AADHAAR', 'PAN', 'DRIVING_LICENSE');

-- CreateEnum
CREATE TYPE "PremiumStatus" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'CONNECTED', 'SKIPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "premiumStatus" "PremiumStatus" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "occupation" TEXT,
    "bio" VARCHAR(500),
    "budgetMin" DOUBLE PRECISION NOT NULL,
    "budgetMax" DOUBLE PRECISION NOT NULL,
    "moveInDate" TIMESTAMP(3),
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" TIMESTAMP(3),

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuestionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionResponse" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DOUBLE PRECISION,
    "dateValue" TIMESTAMP(3),
    "selectedOptions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "compatibilityScore" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isAdminMessage" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idType" "IdType" NOT NULL,
    "idFrontUrl" TEXT NOT NULL,
    "idBackUrl" TEXT,
    "selfieUrl" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "step" INTEGER NOT NULL DEFAULT 0,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PreferredLocations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PreferredLocations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionCategory_name_key" ON "QuestionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Question_categoryId_order_key" ON "Question"("categoryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Option_questionId_order_key" ON "Option"("questionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionResponse_profileId_questionId_key" ON "QuestionResponse"("profileId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_requesterId_receiverId_key" ON "Match"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_user1Id_user2Id_key" ON "Chat"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KYCDocument_userId_key" ON "KYCDocument"("userId");

-- CreateIndex
CREATE INDEX "KYCDocument_userId_idx" ON "KYCDocument"("userId");

-- CreateIndex
CREATE INDEX "KYCDocument_status_idx" ON "KYCDocument"("status");

-- CreateIndex
CREATE INDEX "_PreferredLocations_B_index" ON "_PreferredLocations"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuestionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCDocument" ADD CONSTRAINT "KYCDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredLocations" ADD CONSTRAINT "_PreferredLocations_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredLocations" ADD CONSTRAINT "_PreferredLocations_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
