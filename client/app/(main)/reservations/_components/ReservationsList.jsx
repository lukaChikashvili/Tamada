"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import useFetch from "@/hooks/use-fetch";

import { cancelMeeting } from "@/actions/meeting";
import { MeetingCard } from "@/components/MeetingCard";

export function ReservationsList({ initialData }) {
  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
  } = useFetch(cancelMeeting);


  const handleCancelBooking = async (bookingId) => {
    await cancelBookingFn(bookingId);
  };

 
  const upcomingBookings = initialData?.data?.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBookings = initialData?.data?.filter((booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );


  if (initialData?.data?.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">შენ ჯერ არ დაგიჯავშნია შეხვედრა</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          გადახედე თამადებს და შენი გემოვნების და საჭიროების მიხედვით დაჯავშნე შეხვედა თამადასთან
        </p>
        <Button variant="destructive" asChild>
          <Link href="/tamadas">მოძებნე თამადები</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold mb-4">უახლესი შეხვედრები</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 italic">ახალი ჯავშანი არ არის.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <MeetingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={cancelling}
                showActions
                cancelError={cancelError}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>

      
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">ძველი შეხვედრები</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((booking) => (
              <MeetingCard
                key={booking.id}
                booking={booking}
                showActions={false}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}