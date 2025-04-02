"use server"
import { serializeTamadaData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

async function fileToBase64(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
  }


  export async function processTamadaImageWithAi(file) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key is not configured");
        }

        const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64Image = await fileToBase64(file);

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: file.type,
            },
        };

        const prompt = `
        Analyze this image and extract the following information about the Tamada (Georgian toastmaster):  
        1. Name (if identifiable)  
        2. Year of birth or years of experience  
        3. Estimated price for hiring this Tamada (in approximate value)  
        4. Number of drinks consumed or handled  
        5. City where the Tamada is based  
        6. Languages spoken  
        7. Stomach size (small, medium, large - based on physical features)  
        8. Short bio or listing description  
        9. Humor rating (on a scale from 1 to 10)  
        10. Eloquence rating (on a scale from 1 to 10)  
        11. Nationality  
        12. Years of experience as a Tamada  
        13. Clothing style (traditional, modern, mixed)  
        14. Popularity rating (scale from 0 to 100)  
        15. Types of events handled (wedding, supra, corporate, etc.)  

        Format your response as a clean JSON object with these fields:  
        {
            "name": "",
            "year": 0,
            "price": 0.00,
            "drinks": 0,
            "city": "",
            "language": "",
            "stomachSize": "",
            "description": "",
            "humorLevel": 0,
            "speechQuality": 0,
            "nationality": "",
            "experienceYears": 0,
            "clothingStyle": "",
            "popularityScore": "",
            "eventTypes": ""
        }

        **Do NOT include explanations or disclaimers. Return ONLY the JSON object.**
        `;

        const result = await model.generateContent([imagePart, prompt]);
        const res = await result.response;
        const text =await  res.text();
      
        const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/);
        const cleanedText = jsonMatch ? jsonMatch[1] : text.trim(); 

        try {
            const tamadaDetails = JSON.parse(cleanedText);
            const requiredFields = [
                "name", "year", "price", "drinks", "city", "language", "stomachSize",
                "description", "humorLevel", "speechQuality", "nationality",
                "experienceYears", "clothingStyle", "popularityScore", "eventTypes"
            ];

            const missingFields = requiredFields.filter(field => !(field in tamadaDetails));
            if (missingFields.length > 0) {
                throw new Error(`AI response missing required fields: ${missingFields.join(", ")}`);
            }

            return {
                success: true,
                data: tamadaDetails
            };
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            console.log("Raw response:", text);
            return {
                success: false,
                error: "Failed to parse AI response",
            };
        }
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Gemini API error: " + error.message);
    }
}



export async function AddTamadaToDb({tamadaDatato, images}) {
  
    try { 
        const { userId } = await auth();
        console.log("✅ Authenticated User ID:", userId);
        if (!userId) throw new Error("Unauthorized");
    
        const user = await db.user.findUnique({
          where: { clerkUserId: userId },
        });
    
        if (!user) throw new Error("User not found");

        const tamadaId = uuidv4();
        const folderPath =  `tamadas/${tamadaId}`;

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
    

        const imageUrls = [];

      for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
      .from("tamada-img")
      .upload(filePath, imageBuffer, {
        contentType: `image/${fileExtension}`,
      });

      console.log("Image upload response:", data, error);

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tamada-img/${filePath}`;


    imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
        throw new Error("No valid images were uploaded");
      }
        


      const tamada = await db.tamada.create({
        data: {
          id: tamadaId, // Unique ID for the Tamada
          name: tamadaDatato.name, // Tamada's name
          year: tamadaDatato.year, // Year of birth or experience
          price: tamadaDatato.price, // Price for hiring the Tamada
          drinks: tamadaDatato.drinks, // Number of drinks consumed
          city: tamadaDatato.city, // City where the Tamada is based
          language: tamadaDatato.language, // Languages spoken
          stomachSize: tamadaDatato.stomachSize, // Stomach size (small, medium, large)
          description: tamadaDatato.description, // Short bio or listing description
          images: imageUrls, // List of images
          humorLevel: tamadaDatato.humorLevel, // Humor level (1-10)
          speechQuality: tamadaDatato.speechQuality, // Eloquence rating (1-10)
          nationality: tamadaDatato.nationality, // Nationality
          experienceYears: tamadaDatato.experienceYears, // Years as a Tamada
          clothingStyle: tamadaDatato.clothingStyle, // Traditional, modern, mixed
          popularityScore: tamadaDatato.popularityScore , // Popularity rating (0-100)
          eventTypes: tamadaDatato.eventTypes, // Types of events handled
          featured: tamadaDatato.featured,
          createdAt: new Date(), // Timestamp for creation
        }
      });

      revalidatePath('/admin/tamadas');

      console.log("✅ Tamada successfully added:", tamada);

      return {
        success: true,
      };
    } catch (error) {
        throw new Error("Error adding car:" + error.message);
    }
}



export async function getTamada(search = "") {
   try {
    const { userId } = await auth();
    
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");


    let where = {};

    if(search) {
      where.OR = [
        { name: {contains: search, mode: 'insensitive'}},
        { price: {contains: search, mode: 'insensitive'}},
        { language: {contains: search, mode: 'insensitive'}},
      ];

      const tamadas = await db.tamada.findMany({
        where,
        orderBy: {createdAt: 'desc'}
      });

      const serializedTamadas = tamadas.map(serializeTamadaData);

      return {
        success: true,
        data: serializedTamadas
      }

    }
   } catch (error) {
       console.log(error)
   }
}



export async function deleteTamada(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    
    const tamada = await db.tamada.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!tamada) {
      return {
        success: false,
        error: "tamada not found",
      };
    }

    
    await db.tamada.delete({
      where: { id },
    });


    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

     
      const filePaths = tamada.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/tamada-img\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      
      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("tamada-img")
          .remove(filePaths);

        if (error) {
          console.error("Error deleting images:", error);
         
        }
      }
    } catch (storageError) {
      console.error("Error with storage operations:", storageError);
      
    }

  
    revalidatePath("/admin/tamadas");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting tamada:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}