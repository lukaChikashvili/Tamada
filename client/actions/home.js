"use server"

import { serializeTamadaData } from "@/lib/helpers";
import { db } from "@/lib/prisma";

export async function getFeaturedTamadas(limit = 4) {
    try {
        const tamadas = await db.tamada.findMany({
         where: {
            featured: true
         },
         take: limit,
         orderBy: {createdAt: "desc"}
        });

        return tamadas.map(serializeTamadaData);

        
    } catch (error) {
        throw new Error("Error fetching featured cars:" + error.message);
    }
}