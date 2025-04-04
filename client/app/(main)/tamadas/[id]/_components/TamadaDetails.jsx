"use client"
import { toggleSavedTamada } from '@/actions/carListing';
import useFetch from '@/hooks/use-fetch';
import { useAuth } from '@clerk/nextjs';
import {  Wine } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const TamadaDetails = ({ tamada, testDriveInfo}) => {

    const router = useRouter();
    const { isSignedIn } = useAuth();
    const [isWishListed, setIsWishListed] = useState(tamada.wishlisted);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const {
        loading: savingTamada,
        fn: toggleSavedTamadaFn,
        data: toggleResult,
        error: toggleError,
      } = useFetch(toggleSavedTamada);

      useEffect(() => {
        if (toggleResult?.success) {
            setIsWishListed(toggleResult.saved);
          toast.success(toggleResult.message);
        }
      }, [toggleResult]);

      useEffect(() => {
        if (toggleError) {
          toast.error("Failed to update favorites");
        }
      }, [toggleError]);

      const handleSaveTamada = async () => {
        if (!isSignedIn) {
          toast.error("Please sign in to save tamadas");
          router.push("/sign-in");
          return;
        }
    
        if (savingTamada) return;
    
       
        await toggleSavedTamadaFn(tamada.id);
      };
    
      const handleShare = () => {
        if (navigator.share) {
          navigator
            .share({
              title: `${tamada.year} ${tamada.name} ${tamada.city}`,
              text: `Check out this ${tamada.year} ${tamada.name} ${tamada.year} on tmada!`,
              url: window.location.href,
            })
            .catch((error) => {
              console.log("Error sharing", error);
              copyToClipboard();
            });
        } else {
          copyToClipboard();
        }
      };

      const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      };

      const handleBookTestDrive = () => {
        if (!isSignedIn) {
          toast.error("Please sign in to book a test drive");
          router.push("/sign-in");
          return;
        }
        router.push(`/test-drive/${tamada.id}`);
      };
    
    

  return (
    <div className="flex flex-col lg:flex-row gap-8">
       <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
            {tamada.images && tamada.images.length > 0 ? (
              <Image
                src={tamada.images[currentImageIndex]}
                alt={`${tamada.year} ${tamada.name} ${tamada.city}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Wine className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {tamada.images && tamada.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tamada.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                    index === currentImageIndex
                      ? "border-2 border-red-600"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${tamada.year} ${tamada.name} ${tamada.city} - view ${
                      index + 1
                    }`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

    </div>
    </div>
  )
}

export default TamadaDetails
