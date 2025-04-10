"use client"

import TamadaCard from '@/components/TamadaCard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const SavedTamadaList = ({initialData}) => {

  if (!initialData?.data || initialData?.data.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Heart className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">შენახული თამადები არ არის</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          შენ ჯერ არ შეგინახავს თამადა. დააჭირე გულის იქონს და შეინახე თამადა მოგვიანებით
        </p>
        <Button variant="destructive" asChild>
          <Link href="/tamadas" >მოძებნე თამადა</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='px-12'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialData?.data?.map((value) => (
        <TamadaCard key={value.id} value={{ ...value, saved: true }} />
      ))}
    </div>
    </div>
  )
}

export default SavedTamadaList
