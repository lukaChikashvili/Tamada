"use client"

import Image from 'next/image';
import React from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { CardContent } from './ui/card';

const TamadaCard = ({ value }) => {
  return (
    <div className="relative flex flex-col gap-[10px] w-full border p-4 rounded-md mt-4 shadow-lg overflow-hidden">
      
      {/* Image Section */}
      <div className="relative w-full h-[250px] rounded-md overflow-hidden group">
        {value && value?.images && value.images?.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={value?.images[0]}
              alt={`${value?.name} ${value?.city}`}
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />

            {/* Inset Shadow Transition */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none" />

            {/* Heart Icon in the Top-Right Corner */}
            <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md cursor-pointer">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent>
        <h2 className="font-bold text-slate-800">{value?.name}</h2>
        <h1 className="font-bold text-red-500 text-2xl">{value?.price}</h1>
        <p>{value?.birth} - {value?.city}</p>
      </CardContent>

      {/* Button */}
      <Button className="cursor-pointer" variant="destructive">
        დეტალურად ნახვა
      </Button>
    </div>
  );
};

export default TamadaCard;
