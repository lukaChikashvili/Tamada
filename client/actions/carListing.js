"use server"

import { serializeTamadaData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


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
        
    }

}