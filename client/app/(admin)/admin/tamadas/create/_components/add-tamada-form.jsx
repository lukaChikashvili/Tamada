import React from 'react'
import { z } from 'zod'

const AddTamadaForm = () => {
    
    const tamadaFormSchema = z.object({
        name: z.string().min(1, "name is required"),
        year: z.string().refine((val) => {
            const year = parseInt(val);
            return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
          }, "Valid year required"),
        price: z.string().min(1, "price is required"),
        drinks: z.number().min(1, "drinks is required"),
        city: z.string().min(1, "city is required"),
        language: z.string().min(1, "language is required"),
        stomachSize: z.number().min(1, "stomachSize is required"),
        features: z.string().optional(),  
        description: z.string().optional(), 
        humorLevel: z.number().min(1).max(10, "Humor level should be between 1 and 10"),
        speechQuality: z.number().min(1).max(10, "Speech quality should be between 1 and 10"),
        nationality: z.string().min(1, "Nationality is required"),
        experienceYears: z.number().min(1, "Experience years are required"),
        clothingStyle: z.string().min(1, "Clothing style is required"), 
        popularityScore: z.number().min(0).max(100, "Popularity score should be between 0 and 100"),
        eventTypes: z.array(z.string()).min(1, "At least one event type is required"),  
        alcoholTolerance: z.number().min(1).max(10, "Alcohol tolerance should be between 1 and 10"),
        awards: z.array(z.string()).optional(),  
        


    })

  return (
    <div>
      huyiy
    </div>
  )
}

export default AddTamadaForm
