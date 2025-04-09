"use server"

import { serializeTamadaData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAdmin() {
    const { userId } = await auth();
    if(!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });


    if(!user || user.role !== 'ADMIN') {
        return { authorized: false, reason: "not admin"};
    }

    return { authorized: true, reason: " admin"};

}


export async function getAdminMeetings({ search = "", status = "" }) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
     
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized access");
      }
  
    
      let where = {};
  
      
      if (status) {
        where.status = status;
      }
  
     
      if (search) {
        where.OR = [
          {
            tamada: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          {
            user: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ];
      }
  
      
      const bookings = await db.testDriveBooking.findMany({
        where,
        include: {
          tamada: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
              phone: true,
            },
          },
        },
        orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
      });
  
      const formattedBookings = bookings.map((booking) => ({
        id: booking.id,
        tamadaId: booking.tamadaId,
        tamada: serializeTamadaData(booking.tamada),
        userId: booking.userId,
        user: booking.user,
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


  