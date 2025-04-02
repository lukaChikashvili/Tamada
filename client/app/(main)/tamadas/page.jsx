import { getTamadaFilters } from '@/actions/carListing';
import React from 'react'
import TamadaListing from './_components/TamadaListing';
import TamadaFilters from './_components/TamadaFilters';

export const metadata = {
    title: "ყველა თამადა - ძებნა",
    description: "მოძებნეთ სასურველი თამადა",
  };

const TamadasPage = async () => {

    const filtersData = await getTamadaFilters();
   

      
  return (
    <div className="container mx-auto px-12 py-12">
      <h1 className="text-4xl mb-4 gradient-title font-bold text-red-500">მოძებნე თამადები</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="w-full lg:w-80 flex-shrink-0">
          <TamadaFilters filters={filtersData.data} />
        </div>

       
        <div className="flex-1">
          <TamadaListing />
        </div>
      </div>
    </div>
  )
}

export default TamadasPage
