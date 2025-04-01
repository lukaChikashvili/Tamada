"use server"
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

      if(!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured");

      }

     const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
     const model = genAi.getGenerativeModel({model: "gemini-1.5-flash"});

     const base64Image = await fileToBase64(file);


     const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      };

      const propmt = `
      Analyze this image and extract the following information about the Tamada (Georgian toastmaster):  
      1. Name (if identifiable)  
      2. Age (approximately)  
      3. Birthdate (best estimate)  
      4. Nationality (your best guess)  
      5. Humor Level (on a scale from 1 to 10)  
      6. Drink Number (approximate number of drinks consumed)  
      7. Stomach Size (small, medium, large - based on physical features)  
      8. Speech Quality (expressiveness and eloquence, from 1 to 10)  
      9. Clothing Style (traditional, modern, mixed)  
      10. Confidence Level (how sure you are of the extracted details)  
      11. Short description for a listing or profile  
      
      Format your response as a clean JSON object with these fields:  
      
      {
        "name": "",
        "age": 0,
        "birthDate": "",
        "nationality": "",
        "humorLevel": 0,
        "drinkNumber": 0,
        "stomachSize": "",
        "speechQuality": 0,
        "clothingStyle": "",
        "description": "",
        "confidence": 0.0
      }
      `;

      const result = await model.generateContent([imagePart, prompt]);

      const res = await result.response;
      const text = res.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();


      try {

        const tamadaDetails = JSON.parse(cleanedText);

        const requiredFields = [
            "name",
            "age",
            "birthDate",
            "nationality",
            "humorLevel",
            "drinkNumber",
            "stomachSize",
            "speechQuality",
            "clothingStyle",
            "description",
            "confidence",
          ];

          const missingFields = requiredFields.filter(
            (field) => !(field in tamadaDetails)
          );
    
          if (missingFields.length > 0) {
            throw new Error(
              `AI response missing required fields: ${missingFields.join(", ")}`
            );
          }

          return {
            success: true,
            data: tamadaDetails
          }
        
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.log("Raw response:", text);
        return {
          success: false,
          error: "Failed to parse AI response",
        };
      }

        
    } catch (error) {
        console.error();
        throw new Error("Gemini API error:" + error.message);
    }
}



export async function addTamada({tamadaData, images}) {
    
    try { 
        const { userId } = await auth();
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
          name: tamadaData.name, // Tamada's name
          year: tamadaData.year, // Year of birth or experience
          price: tamadaData.price, // Price for hiring the Tamada
          drinks: tamadaData.drinkNumber, // Number of drinks consumed
          city: tamadaData.city, // City where the Tamada is based
          language: tamadaData.language, // Languages spoken
          stomachSize: tamadaData.stomachSize, // Stomach size (small, medium, large)
          features: tamadaData.features, // Unique features
          description: tamadaData.description, // Short bio or listing description
          images: imageUrls, // List of images
          humorLevel: tamadaData.humorLevel, // Humor level (1-10)
          speechQuality: tamadaData.speechQuality, // Eloquence rating (1-10)
          nationality: tamadaData.nationality, // Nationality
          experienceYears: tamadaData.experienceYears, // Years as a Tamada
          clothingStyle: tamadaData.clothingStyle, // Traditional, modern, mixed
          popularityScore: tamadaData.popularityScore ?? 0, // Popularity rating (0-100)
          eventTypes: tamadaData.eventTypes, // Types of events handled
          alcoholTolerance: tamadaData.alcoholTolerance, // Alcohol tolerance (1-10)
          awards: tamadaData.awards, // Awards received
          createdAt: new Date(), // Timestamp for creation
        }
      });

      revalidatePath('/admin/tamadas');

      console.log(tamada)

      return {
        success: true,
      };
    } catch (error) {
        throw new Error("Error adding car:" + error.message);
    }
}