import { getSavedTamadas } from '@/actions/carListing';
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import SavedTamadaList from './_components/SavedTamadaList';

const page = async () => {
  const { userId } = await auth();  

  if(!userId) {
    redirect('sign-in?redirect=/saved-tamadas');

  }

  const savedTamadasResult = await getSavedTamadas();

  return (
    
        <div className="container mx-auto px-12 md:px-24 py-12">
      <h1 className="text-4xl mb-6 gradient-title text-red-500 font-bold"> შენახული თამადები</h1>
       <SavedTamadaList initialData = {savedTamadasResult} />
    </div>
    
  )
}

export default page
