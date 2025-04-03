"use server"

import { serializeTamadaData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export async function getTamadaFilters() {
    try {
        const names = await db.tamada.findMany({
           
            select: { name: true },
            distinct: ["name"],
            orderBy: { name: "asc" },
          });

       

          const languages = await db.tamada.findMany({
           
            select: { language: true },
            distinct: ["language"],
            orderBy: { language: "asc" },
          });

          const cities = await db.tamada.findMany({
           
            select: { city: true },
            distinct: ["city"],
            orderBy: { city: "asc" },
          });
        

          const stomachSizes = await db.tamada.findMany({
           
            select: { stomachSize: true },
            distinct: ["stomachSize"],
          
          });

          const popularityScores = await db.tamada.findMany({
           
            select: { popularityScore: true },
            distinct: ["popularityScore"],
            orderBy: { popularityScore: "asc" },
          });

          const priceAggregations = await db.tamada.aggregate({
      
            _min: { price: true },
            _max: { price: true },
          });

          return {
            success: true,
            data: {
              names: names.map((item) => item.name),
              languages: languages.map((item) => item.language),
              cities: cities.map((item) => item.city),
              stomachSizes: stomachSizes.map((item) => item.stomachSize),
              popularityScores: popularityScores.map((item) => item.popularityScore),
              priceRange: {
                min: priceAggregations._min.price
                  ? parseFloat(priceAggregations._min.price.toString())
                  : 0,
                max: priceAggregations._max.price
                  ? parseFloat(priceAggregations._max.price.toString())
                  : 100000,
              },
            },
          };
        
        
    } catch (error) {
        throw new Error("Error fetching tamada filters:" + error.message);
    }
}


export async function getTamadas({
     search = "",
     name = "",
     language = "",
     city = "",
     stomachSize = "",
     popularityScore = "",
     minPrice = 0,
     maxPrice = Number.MAX_SAFE_INTEGER,
     sortBy = "newest",
     page = 1,
     limit = 6
}) {

    try {
        const { userId } = await auth();
       let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    let where = {
        status: "AVAILABLE",
      };

      console.log("Query Filters:", JSON.stringify(where, null, 2));
  
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
  
      if (name) where.name = { equals: name, mode: "insensitive" };
      if (language) where.language = { equals: language, mode: "insensitive" };
      if (stomachSize) where.stomachSize = { equals: stomachSize, mode: "insensitive" };
     
      // Add price range
      where.price = {
        gte: parseFloat(minPrice) || 0,
      };
  
      if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
        where.price.lte = parseFloat(maxPrice);
      }
  
      // Calculate pagination
      const skip = (page - 1) * limit;
  
      // Determine sort order
      let orderBy = {};
      switch (sortBy) {
        case "priceAsc":
          orderBy = { price: "asc" };
          break;
        case "priceDesc":
          orderBy = { price: "desc" };
          break;
        case "newest":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }
  
      
      const totalTamadas = await db.tamada.count({ where });
  
      
      const tamadas = await db.tamada.findMany({
        where,
        take: limit,
        skip,
        orderBy,
      });

      console.log(tamadas)
  

      let wishlisted = new Set();
      if (dbUser) {
        const savedTamadas = await db.userSavedTamada.findMany({
          where: { userId: dbUser.id },
          select: { tamadaId: true },
        });
  
        wishlisted = new Set(savedTamadas.map((saved) => saved.tamadaId));
      }
  
      // Serialize and check wishlist status
      const serializedTamadas = tamadas.map((tamada) =>
        serializeTamadaData(tamada, wishlisted.has(tamada.id))
      );
  
      

   
      return {
        success: true,
        data: serializedTamadas,
        pagination: {
          total: totalTamadas,
          page,
          limit,
          pages: Math.ceil(totalTamadas / limit),
        },
      };
      
    
        
    } catch (error) {
      console.error("Error fetching Tamadas:", error);
      return {
          success: false,
          message: "Failed to fetch tamadas",
      };
    }

}


export async function toggleSavedTamada(tamadaId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    
    const tamada = await db.tamada.findUnique({
      where: { id: tamadaId },
    });

    if (!tamada) {
      return {
        success: false,
        error: "Tamada not found",
      };
    }

    
    const existingSave = await db.userSavedTamada.findUnique({
      where: {
        userId_tamadaId: {
          userId: user.id,
          tamadaId,
        },
      },
    });

    
    if (existingSave) {
      await db.userSavedTamada.delete({
        where: {
          userId_tamadaId: {
            userId: user.id,
            tamadaId,
          },
        },
      });

      revalidatePath(`/saved-tamadas`);
      return {
        success: true,
        saved: false,
        message: "tamada removed from favorites",
      };
    }

    
    await db.userSavedTamada.create({
      data: {
        userId: user.id,
        tamadaId,
      },
    });

    revalidatePath(`/saved-tamadas`);
    return {
      success: true,
      saved: true,
      message: "tamadas added to favorites",
    };
  } catch (error) {
    throw new Error("Error toggling saved car:" + error.message);
  }
}



export async function getSavedTamadas() {
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

    
    const savedTamadas = await db.userSavedTamada.findMany({
      where: { userId: user.id },
      include: {
        tamada: true,
      },
      orderBy: { savedAt: "desc" },
    });

    
    const tamadas = savedTamadas.map((saved) => serializeTamadaData(saved.tamada));

    return {
      success: true,
      data: tamadas,
    };
  } catch (error) {
    console.error("Error fetching saved tamadas:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}



export async function getTamadaById(tamadaId) {
  try {
    
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

   
    const tamada = await db.tamada.findUnique({
      where: { id: tamadaId },
    });

    if (!tamada) {
      return {
        success: false,
        error: "Tamada not found",
      };
    }

    
    let isWishlisted = false;
    if (dbUser) {
      const savedTamada = await db.userSavedTamada.findUnique({
        where: {
          userId_tamadaId: {
            userId: dbUser.id,
            tamadaId,
          },
        },
      });

      isWishlisted = !!savedTamada;
    }

    
    const existingMeeting = await db.meetingBooking.findFirst({
      where: {
        tamadaId,
        userId: dbUser.id,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let userMeeting = null;

    if (existingMeeting) {
      userMeeting = {
        id: existingMeeting.id,
        status: existingMeeting.status,
        bookingDate: existingMeeting.bookingDate.toISOString(),
      };
    }

    
   
    return {
      success: true,
      data: {
        ...serializeTamadaData(tamada, isWishlisted),
        testDriveInfo: {
          userMeeting,
         
          
        
        },
      },
    };
  } catch (error) {
    throw new Error("Error fetching car details:" + error.message);
  }
}
