
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAdminMeetings } from "@/actions/admin";
import { ReservationsList } from "./_components/ReservationsList";

export const metadata = {
  title: "ჩემი დაჯავშნილი შეხვედრები ",
 
};

export default async function ReservationsPage() {
 
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/reservations");
  }

  const reservationsResult = await getAdminMeetings();

  return (
    <div className="container mx-auto px-12 py-12">
      <h1 className="text-4xl mb-6 gradient-title text-red-500 font-bold">შენი დაჯავშნილი შეხვედრები</h1>
      <ReservationsList initialData={reservationsResult} />
    </div>
  );
}