"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { Calendar,  Clock, User, Loader2, ArrowRight, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const formatTime = (timeString) => {
  try {
    return format(parseISO(`2022-01-01T${timeString}`), "h:mm a");
  } catch (error) {
    return timeString;
  }
};


const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-amber-100 text-amber-800">მუშავდება</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-green-100 text-green-800">დადასტურებული</Badge>;
    case "COMPLETED":
      return <Badge className="bg-blue-100 text-blue-800">შესრულებული</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-100 text-gray-800">გაუქმებული</Badge>;
    case "NO_SHOW":
      return <Badge className="bg-red-100 text-red-800">არ მაჩვენო</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function MeetingCard({
  booking,
  onCancel,
  showActions = true,
  isPast = false,
  isAdmin = false,
  isCancelling = false,
  renderStatusSelector = () => null,
}) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  
  const handleCancel = async () => {
    if (!onCancel) return;

    await onCancel(booking.id);
    setCancelDialogOpen(false);
  };

  return (
    <>
      <Card
        className={`overflow-hidden ${
          isPast ? "opacity-80 hover:opacity-100 transition-opacity" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          
          <div className="sm:w-1/4 relative h-40 sm:h-auto px-4">
            {booking.tamada.images && booking.tamada.images.length > 0 ? (
              <div className="relative w-full h-full">
                <Image
                  src={booking.tamada.images[0]}
                  alt={`${booking.tamada.name} ${booking.tamada.city}`}
                  fill
                  className="object-cover rounded-md shadow-lg"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Wine className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 sm:hidden">
              {getStatusBadge(booking.status)}
            </div>
          </div>

          
          <div className="p-4 sm:w-1/2 sm:flex-1">
            <div className="hidden sm:block mb-2">
              {getStatusBadge(booking.status)}
            </div>

            <h3 className="text-lg font-bold mb-1">
              {booking.tamada.year} {booking.tamada.make} {booking.tamada.model}{" "}
            </h3>
            {renderStatusSelector()}

            <div className="space-y-2 my-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>

              
              {isAdmin && booking.user && (
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {booking.user.name || booking.user.email}
                </div>
              )}
            </div>
          </div>

   
          {showActions && (
            <div className="p-4 border-t sm:border-t-0 sm:border-l sm:w-1/4 sm:flex sm:flex-col sm:justify-center sm:items-center sm:space-y-2">
              
              {booking.notes && (
                <div className="bg-gray-50 p-2 rounded text-sm w-full">
                  <p className="font-medium">კომენტარი:</p>
                  <p className="text-gray-600">{booking.notes}</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full my-2 sm:mb-0"
                asChild
              >
                <Link
                  href={`/tamadas/${booking.tamadaId}`}
                  className="flex items-center justify-center"
                >
                  ნახე თამადა
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "გაუქმება"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      
      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>გააუქმე შეხვედრა</DialogTitle>
              <DialogDescription>
                დარწმუნებული ხარ რომ გინდა გააუქმო შეხვედრა{" "}
                {booking.tamada.year} {booking.tamada.make} {booking.tamada.model}? მოქმედებას უკან ვერ დააბრუნებ
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">თარიღი:</span>
                  <span>
                    {format(
                      new Date(booking.bookingDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">დრო:</span>
                  <span>
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                დატოვე შეხვედრის ჯავშანი
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    უქმდება...
                  </>
                ) : (
                  "გააუქმე შეხვედრა"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}