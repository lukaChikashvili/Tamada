import { getTamadaById } from '@/actions/carListing';
import { notFound } from 'next/navigation';
import React from 'react'
import MeetingForm from './_components/MeetingForm';

export async function generateMetadata() {
    return {
      title: `დაჯავშნე შეხვედრა | თამადა`,
      description: `დაჯავშნე შეხვედრა წამებში`,
    };
  }

const MeetingPage = async ({ params }) => {

    const { id } = await params;
    const result = await getTamadaById(id);

    if (!result.success) {
        notFound();
      }


    

  return (
    <div>
       <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl mb-6 gradient-title text-red-500 font-bold">დაჯავშნე შეხვედრა</h1>
      <MeetingForm
        tamada={result.data}
        meetingInfo={result.data.testDriveInfo}
      />
    </div>
    </div>
  )
}

export default MeetingPage
