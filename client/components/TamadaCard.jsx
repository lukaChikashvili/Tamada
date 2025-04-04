"use client"

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { CardContent } from './ui/card';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/use-fetch';
import { toggleSavedTamada } from '@/actions/carListing';
import { useAuth } from '@clerk/nextjs';

const TamadaCard = ({ value }) => {
  const { isSignedIn } = useAuth();
  const [isSaved, setIsSaved] = useState(value.wishlisted);

  const router = useRouter();

 

  const {
    loading: isToggling,
    fn: toggleSavedTamadas,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedTamada);

  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!isSignedIn) {
      toast.error("Please sign in to save tamadas");
      router.push("/sign-in");
      return;
    }
  
    if (isToggling) return;
  
    try {
      const result = await toggleSavedTamadas(value.id);
      
      if (result?.success) {
        setIsSaved(result.saved);  
        toast.success(result.message);
      } else {
        toast.error("Failed to save tamada");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("An error occurred while saving tamada");
    }
  };
 


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
            <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={20} />
          )}
        </Button>
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
        <h1 className="font-bold text-red-500 text-2xl">{value?.price} &#x20BE;</h1>
        <p>{value?.year} - {value?.city}</p>
      </CardContent>

      {/* Button */}
      <Button onClick={() => {
              router.push(`/tamadas/${value.id}`);
            }} className="cursor-pointer" variant="destructive">
        დეტალურად ნახვა
      </Button>
    </div>
  );
};

export default TamadaCard;
