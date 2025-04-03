import { getTamadaById } from '@/actions/carListing';
import React from 'react'

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
  return (
    <div>
      {id}
    </div>
  )
}

export default TamadaPage
