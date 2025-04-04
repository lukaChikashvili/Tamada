import { getTamadaById } from '@/actions/carListing';
import React from 'react'
import TamadaDetails from './_components/TamadaDetails';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getTamadaById(id);

  if (!result.success) {
    return {
      title: "თამადა ვერ მოიძებნა ",
      description: "მოთხოვნილი თამადა ვერ მოიძებნა",
    };
  }

  const tamada = result.data;

  return {
    title: `${tamada.year} ${tamada.name} ${tamada.city} `,
    description: tamada.description.substring(0, 160),
    openGraph: {
      images: tamada.images?.[0] ? [tamada.images[0]] : [],
    },
  };
}

const TamadaPage = async ({ params }) => {
  const { id } = await params;

  const result = await getTamadaById(id);

  
  if (!result.success) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
    <TamadaDetails tamada={result.data} meetingInfo={result.data.testDriveInfo} />
  </div>
  )
}

export default TamadaPage
