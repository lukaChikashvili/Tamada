-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "MeetingBooking" ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';
