"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, CalendarRange, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import useFetch from "@/hooks/use-fetch";
import { getAdminMeetings,  updateMeetingStatus,  updateTestDriveStatus } from "@/actions/admin";

import { cancelMeeting } from "@/actions/meeting";
import { MeetingCard } from "@/components/MeetingCard";

export const MeetingsList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  
  const {
    loading: fetchingTestDrives,
    fn: fetchMeetings,
    data: meetingsData,
    error: meetingsError,
  } = useFetch(getAdminMeetings);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateMeetingStatus);

  const {
    loading: cancelling,
    fn: cancelTestDriveFn,
    data: cancelResult,
    error: cancelError,
  } = useFetch(cancelMeeting);

  
  useEffect(() => {
    fetchMeetings({ search, status: statusFilter });
  }, [search, statusFilter]);

  
  useEffect(() => {
    if (meetingsError) {
      toast.error("Failed to load test drives");
    }
    if (updateError) {
      toast.error("Failed to update test drive status");
    }
    if (cancelError) {
      toast.error("Failed to cancel test drive");
    }
  }, [meetingsError, updateError, cancelError]);


  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Test drive status updated successfully");
      fetchMeetings({ search, status: statusFilter });
    }
    if (cancelResult?.success) {
      toast.success("Test drive cancelled successfully");
      fetchMeetings({ search, status: statusFilter });
    }
  }, [updateResult, cancelResult]);

 
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMeetings({ search, status: statusFilter });
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus) {
      await updateStatusFn(bookingId, newStatus);
    }
  };

  const handleCancel = async (bookingId) => {
    await cancelTestDriveFn(bookingId);
  };

  return (
    <div className="space-y-4">
    
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
     
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full sm:w-48"
          >
            <SelectTrigger>
              <SelectValue placeholder="ყველა სტატუსი" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem>ყველა სტატუსი</SelectItem>
              <SelectItem value="PENDING">მუშავდება</SelectItem>
              <SelectItem value="CONFIRMED">დადასტურებული</SelectItem>
              <SelectItem value="COMPLETED">შესრულებული</SelectItem>
              <SelectItem value="CANCELLED">გაუქმებული</SelectItem>
              <SelectItem value="NO_SHOW">არ მაჩვენო</SelectItem>
            </SelectContent>
          </Select>

         
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="მოძებნე თამადით ან მომხმარებლით..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="destructive" className="ml-2">
              ძებნა
            </Button>
          </form>
        </div>
      </div>

   
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
             დაჯავშნილი შეხვედრები თამადასთან
          </CardTitle>
          <CardDescription>
            მართე ყველა ჯავშნის ინფორმაცია 
          </CardDescription>
        </CardHeader>

        <CardContent>
          {fetchingTestDrives && !meetingsData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : meetingsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>შეცდომა</AlertTitle>
              <AlertDescription>
               ვერ ჩამოიტვირთა შეხვედრები. ცადეთ მოგვიანებით.
              </AlertDescription>
            </Alert>
          ) : meetingsData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CalendarRange className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
               შეხვედრები ვერ მოიძებნა
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter || search
                  ? "ვერაფერი მოიძებნა ამ ძებნის კრიტერიუმებით"
                  : "ჯერ არ დაუჯავშნიათ შეხვედრა."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetingsData?.data?.map((booking) => (
                <div key={booking.id} className="relative">
                  <MeetingCard
                    booking={booking}
                    onCancel={handleCancel}
                    showActions={["PENDING", "CONFIRMED"].includes(
                      booking.status
                    )}
                    isAdmin={true}
                    isCancelling={cancelling}
                    cancelError={cancelError}
                    renderStatusSelector={() => (
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(booking.id, value)
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">მუშავდება</SelectItem>
                          <SelectItem value="CONFIRMED">დადასტურებული</SelectItem>
                          <SelectItem value="COMPLETED">შესრულებული</SelectItem>
                          <SelectItem value="CANCELLED">გაუქმებული</SelectItem>
                          <SelectItem value="NO_SHOW">არ მაჩვენო</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};