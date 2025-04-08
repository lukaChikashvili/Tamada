"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/dist/types/server";
import { revalidatePath } from "next/cache";

export async function meetingTamada({
    tamadaId,
    bookingDate, 
    startTime, 
    endTime,
    notes
}) {
   try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to book a test drive");

   
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found in database");

    const tamada = await db.tamada.findUnique({
        where: {id: tamadaId, status: "AVAILABLE"},
    });

    if(!tamada) throw new Error("Car not available for test drive");

    const existingBooking = await db.meetingBooking.findFirst({
        where: {
          tamadaId,
          bookingDate: new Date(bookingDate),
          startTime,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      if (existingBooking) {
        throw new Error(
          "This time slot is already booked. Please select another time."
        );
      }

      const booking = await db.meetingBooking.create({
        data: {
          tamadaId,
          userId: user.id,
          bookingDate: new Date(bookingDate),
          startTime,
          endTime,
          notes: notes || null,
          status: "PENDING",
        },
      });

      revalidatePath(`/meeting/${tamadaId}`);
    revalidatePath(`/tamadas/${tamadaId}`);
  
    return {
        success: true,
        data: booking,
      };
    
   } catch (error) {
    console.error("Error booking test drive:", error);
    return {
      success: false,
      error: error.message || "Failed to book test drive",
    };
   }
}