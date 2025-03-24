import { GoogleGenerativeAI } from "@google/generative-ai";

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