import Image from 'next/image';
import React from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { CardContent } from './ui/card';

const TamadaCard = ({ value }) => {
  return (
    <div className="relative flex flex-col gap-[10px] w-full border p-4 rounded-md mt-4 shadow-lg overflow-hidden">
    
      <div className="relative w-full h-[250px] rounded-md overflow-hidden">
        <Image 
          src={value.img} 
          alt={value.name} 
          layout="fill" 
          objectFit="cover" 
          className="cursor-pointer hover:scale-105 transition-transform duration-300"
        />
        
       
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/70 rounded-full p-2 hover:bg-white">
          <Heart className="w-5 h-5 text-red-500" />
        </Button>
      </div>

      <CardContent>
      <h2 className="font-bold text-slate-800">{value.name}</h2>
      <h1 className="font-bold text-red-500 text-2xl">{value.price}</h1>
      <p>{value.birth} - {value.drinkNumber}</p>
      </CardContent>
      <Button className="cursor-pointer" variant="destructive">
        დეტალურად ნახვა
      </Button>
    </div>
  );
};

export default TamadaCard;
