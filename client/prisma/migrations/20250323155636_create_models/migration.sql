-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tamada" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "drinks" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "stomachSize" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedTamada" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tamadaId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSavedTamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingBooking" (
    "id" TEXT NOT NULL,
    "tamadaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Tamada_name_drinks_idx" ON "Tamada"("name", "drinks");

-- CreateIndex
CREATE INDEX "Tamada_price_idx" ON "Tamada"("price");

-- CreateIndex
CREATE INDEX "Tamada_features_idx" ON "Tamada"("features");

-- CreateIndex
CREATE INDEX "Tamada_language_idx" ON "Tamada"("language");

-- CreateIndex
CREATE INDEX "Tamada_city_idx" ON "Tamada"("city");

-- CreateIndex
CREATE INDEX "Tamada_stomachSize_idx" ON "Tamada"("stomachSize");

-- CreateIndex
CREATE INDEX "UserSavedTamada_userId_idx" ON "UserSavedTamada"("userId");

-- CreateIndex
CREATE INDEX "UserSavedTamada_tamadaId_idx" ON "UserSavedTamada"("tamadaId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedTamada_userId_tamadaId_key" ON "UserSavedTamada"("userId", "tamadaId");

-- CreateIndex
CREATE INDEX "MeetingBooking_tamadaId_idx" ON "MeetingBooking"("tamadaId");

-- CreateIndex
CREATE INDEX "MeetingBooking_userId_idx" ON "MeetingBooking"("userId");

-- CreateIndex
CREATE INDEX "MeetingBooking_bookingDate_idx" ON "MeetingBooking"("bookingDate");

-- AddForeignKey
ALTER TABLE "UserSavedTamada" ADD CONSTRAINT "UserSavedTamada_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedTamada" ADD CONSTRAINT "UserSavedTamada_tamadaId_fkey" FOREIGN KEY ("tamadaId") REFERENCES "Tamada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingBooking" ADD CONSTRAINT "MeetingBooking_tamadaId_fkey" FOREIGN KEY ("tamadaId") REFERENCES "Tamada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingBooking" ADD CONSTRAINT "MeetingBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
