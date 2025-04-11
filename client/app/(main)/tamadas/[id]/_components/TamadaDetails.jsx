"use client"
import { toggleSavedTamada } from '@/actions/carListing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useFetch from '@/hooks/use-fetch';
import { useAuth } from '@clerk/nextjs';
import { format } from 'date-fns';
import {  Calendar, Heart, Languages, MessageSquare, Radius, Share2, Shirt, Wine } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const TamadaDetails = ({ tamada, meetingInfo}) => {

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
          toast.error("გთხოვთ გაიაროთ ავტორიზაცია");
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
              text: `Check out this ${tamada.year} ${tamada.name} ${tamada.year} on tamada!`,
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
          toast.error("გაიარეთ ავტორიზაცია შეხვედრის დაჯავშნამდე");
          router.push("/sign-in");
          return;
        }
        router.push(`/meeting/${tamada.id}`);
      };
    
    

  return (
    <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36  ">
       <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4 ">
            {tamada.images && tamada.images.length > 0 ? (
              <Image
                src={tamada.images[currentImageIndex]}
                alt={`${tamada.year} ${tamada.name} ${tamada.city}`}
                fill
                className="object-cover "
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

<div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-1 ${
                isWishListed ? "text-red-500" : ""
              }`}
              onClick={handleSaveTamada}
              disabled={savingTamada}
            >
              <Heart
                className={`h-5 w-5 ${isWishListed ? "fill-red-500" : ""}`}
              />
              {isWishListed ? "შენახული" : "შენახვა"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              გაზიარება
            </Button>
          </div>

          <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">აღწერა</h3>
            <p className="whitespace-pre-line text-gray-700">
              {tamada.description}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">მახასიათებლები</h3>
            <ul className="grid grid-cols-1 gap-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {tamada.drinks} ღვინის ჭიქა
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {tamada.humorLevel} იუმორის დონე
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {tamada.speechQuality} საუბრის ხარისხი
              </li>
              {tamada.experienceYears && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                  {tamada.experienceYears} წელი გამოცდილება
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                {tamada.popularityScore} 
              </li>
            </ul>
          </div>
        </div>
      </div>
        </div>


        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2" variant="destructive">{tamada.name}</Badge>
          </div>

          <h1 className="text-4xl font-bold mb-1">
            {tamada.year} - {tamada.city} - {tamada.eventTypes}
          </h1>

          <div className="text-3xl font-bold text-red-600">
            {tamada.price} &#x20BE;
          </div>

         
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Radius className="text-gray-500 h-5 w-5" />
              <span>{tamada.stomachSize.toLocaleString()} ღიპის ზომა</span>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="text-gray-500 h-5 w-5" />
              <span>{tamada.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shirt className="text-gray-500 h-5 w-5" />
              <span>{tamada.clothingStyle}</span>
            </div>

          </div>

          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>გაქვს შეკითხვები?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                ჩვენი წარმომადგენლები ყველა შეკითხვაზე გიპასუხებენ
              </p>
              <a href="mailto:help@tamadaa.in">
                <Button variant="outline" className="w-full">
                  მოითხოვე ინფორმაცია
                </Button>
              </a>
            </CardContent>
          </Card>

          {tamada.status !== "UNAVAILABLE" && (
            <Button variant="destructive"
              className="w-full py-6 text-lg cursor-pointer"
              onClick={handleBookTestDrive}
              disabled={meetingInfo.userMeeting}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {meetingInfo.userMeeting
                ? `დაჯავშნილია ${format(
                    new Date(meetingInfo.userMeeting.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "დაჯავშნე შეხვედრა"}
            </Button>
          )}



 </div>

 

 
 </div>
    
  )
}

export default TamadaDetails
