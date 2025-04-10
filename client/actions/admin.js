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


export async function getAdminMeetings(params = {}) {
  const { search = "", status = "" } = params;

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
  
      
      const bookings = await db.meetingBooking.findMany({
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


  export async function updateMeetingStatus(bookingId, newStatus) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized access");
      }
  
     
      const booking = await db.meetingBooking.findUnique({
        where: { id: bookingId },
      });
  
      if (!booking) {
        throw new Error("Booking not found");
      }
  
      
      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ];
      if (!validStatuses.includes(newStatus)) {
        return {
          success: false,
          error: "Invalid status",
        };
      }
  
      
      await db.meetingBooking.update({
        where: { id: bookingId },
        data: { status: newStatus },
      });
  
      
      revalidatePath("/admin/meetings");
      revalidatePath("/reservations");
  
      return {
        success: true,
        message: "Test drive status updated successfully",
      };
    } catch (error) {
      throw new Error("Error updating test drive status:" + error.message);
    }
  }
  
  export async function getDashboardData() {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user || user.role !== "ADMIN") {
        return {
          success: false,
          error: "Unauthorized",
        };
      }
  

      const [tamadas, meetings] = await Promise.all([
   
        db.tamada.findMany({
          select: {
            id: true,
            status: true,
            featured: true,
          },
        }),
  
  
        db.meetingBooking.findMany({
          select: {
            id: true,
            status: true,
            tamadaId: true,
          },
        }),
      ]);
  
      
      const totalTamadas = tamadas.length;
      const availableTamadas = tamadas.filter(
        (tamada) => tamada.status === "AVAILABLE"
      ).length;
      const soldCars = tamadas.filter((tamada) => tamada.status === "SOLD").length;
      const unavailableCars = tamadas.filter(
        (tamada) => tamada.status === "UNAVAILABLE"
      ).length;
      const featuredCars = tamadas.filter((tamada) => tamada.featured === true).length;
  
 
      const totalBookings = meetings.length;
      const pendingTestDrives = meetings.filter(
        (td) => td.status === "PENDING"
      ).length;
      const confirmedTestDrives = meetings.filter(
        (td) => td.status === "CONFIRMED"
      ).length;
      const completedTestDrives = meetings.filter(
        (td) => td.status === "COMPLETED"
      ).length;
      const cancelledTestDrives = meetings.filter(
        (td) => td.status === "CANCELLED"
      ).length;
      const noShowTestDrives = meetings.filter(
        (td) => td.status === "NO_SHOW"
      ).length;
  
      
      const completedTestDriveCarIds = meetings
        .filter((td) => td.status === "COMPLETED")
        .map((td) => td.carId);
  
      const soldCarsAfterTestDrive = tamadas.filter(
        (tamada) =>
        tamada.status === "SOLD" && completedTestDriveCarIds.includes(tamada.id)
      ).length;
  
      const conversionRate =
        completedTestDrives > 0
          ? (soldCarsAfterTestDrive / completedTestDrives) * 100
          : 0;
  
      return {
        success: true,
        data: {
          tamadas: {
            total: totalTamadas,
            available: availableTamadas,
            sold: soldCars,
            unavailable: unavailableCars,
            featured: featuredCars,
          },
          testDrives: {
            total: totalTestDrives,
            pending: pendingTestDrives,
            confirmed: confirmedTestDrives,
            completed: completedTestDrives,
            cancelled: cancelledTestDrives,
            noShow: noShowTestDrives,
            conversionRate: parseFloat(conversionRate.toFixed(2)),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }