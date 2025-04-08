"use server"

import { serializeTamadaData } from "@/lib/helpers";
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


export async function getUserMeetings() {
    try {
      const { userId } = await auth();
      if (!userId) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }
  
    
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
  
     
      const bookings = await db.meetingBooking.findMany({
        where: { userId: user.id },
        include: {
          tamada: true,
        },
        orderBy: { bookingDate: "desc" },
      });
  
      
      const formattedBookings = bookings.map((booking) => ({
        id: booking.id,
        tamadaId: booking.tamadaId,
        tamada: serializeTamadaData(booking.tamada),
        bookingDate: booking.bookingDate.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }));
  
      return {
        success: true,
        data: formattedBookings,
      };
    } catch (error) {
      console.error("Error fetching test drives:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }


  export async function cancelMeeting(bookingId) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }
  
      
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
  
      
      const booking = await db.meetingBooking.findUnique({
        where: { id: bookingId },
      });
  
      if (!booking) {
        return {
          success: false,
          error: "Booking not found",
        };
      }
  
      
      if (booking.userId !== user.id || user.role !== "ADMIN") {
        return {
          success: false,
          error: "Unauthorized to cancel this booking",
        };
      }
  
      
      if (booking.status === "CANCELLED") {
        return {
          success: false,
          error: "Booking is already cancelled",
        };
      }
  
      if (booking.status === "COMPLETED") {
        return {
          success: false,
          error: "Cannot cancel a completed booking",
        };
      }
  
     
      await db.meetingBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
  
      revalidatePath("/reservations");
      revalidatePath("/admin/meetings");
  
      return {
        success: true,
        message: "Test drive cancelled successfully",
      };
    } catch (error) {
      console.error("Error cancelling test drive:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }