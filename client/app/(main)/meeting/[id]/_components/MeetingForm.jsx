"use client"
import { meetingTamada } from '@/actions/meeting'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import useFetch from '@/hooks/use-fetch'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { CalendarIcon, CheckCircle2, Loader2, Wine } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const meetingSchema = z.object({
    date: z.date({
      required_error: "აირჩიეთ თარიღი შეხვედრის დაჯავშნამდე",
    }),
    timeSlot: z.string({
      required_error: "აირჩიეთ დროის მონაკვეთი",
    }),
    notes: z.string().optional(),
  });


const MeetingForm = ({ tamada, meetingInfo }) => {
    const router = useRouter();
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    
    
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
      } = useForm({
        resolver: zodResolver(meetingSchema),
        defaultValues: {
          date: undefined,
          timeSlot: undefined,
          notes: "",
        },
      });

      const dealership = meetingInfo?.dealership;
      
      const existingBookings = meetingInfo?.existingBookings || [];

      const selectedDate = watch("date");

      const {
        loading: bookingInProgress,
        fn: bookTestDriveFn,
        data: bookingResult,
        error: bookingError,
      } = useFetch(meetingTamada);

      useEffect(() => {
        if (bookingResult?.success) {
          setBookingDetails({
            date: format(bookingResult?.data?.bookingDate, "EEEE, MMMM d, yyyy"),
            timeSlot: `${format(
              parseISO(`2022-01-01T${bookingResult?.data?.startTime}`),
              "h:mm a"
            )} - ${format(
              parseISO(`2022-01-01T${bookingResult?.data?.endTime}`),
              "h:mm a"
            )}`,
            notes: bookingResult?.data?.notes,
          });
          setShowConfirmation(true);
    
          
          reset();
        }
      }, [bookingResult, reset]);


      useEffect(() => {
        if (bookingError) {
          toast.error(
            bookingError.message || "მოხდა რაღაც შეცდომა."
          );
        }
      }, [bookingError]);


      useEffect(() => {
        if (!selectedDate || !dealership?.workingHours) return;
    
        const selectedDayOfWeek = format(selectedDate, "EEEE").toUpperCase();
    
        
        const daySchedule = dealership.workingHours.find(
          (day) => day.dayOfWeek === selectedDayOfWeek
        );
    
        if (!daySchedule || !daySchedule.isOpen) {
          setAvailableTimeSlots([]);
          return;
        }
    
       
        const openHour = parseInt(daySchedule.openTime.split(":")[0]);
        const closeHour = parseInt(daySchedule.closeTime.split(":")[0]);
    
       
        const slots = [];
        for (let hour = openHour; hour < closeHour; hour++) {
          const startTime = `${hour.toString().padStart(2, "0")}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    
         
          const isBooked = existingBookings.some((booking) => {
            const bookingDate = booking.date;
            return (
              bookingDate === format(selectedDate, "yyyy-MM-dd") &&
              (booking.startTime === startTime || booking.endTime === endTime)
            );
          });
    
          if (!isBooked) {
            slots.push({
              id: `${startTime}-${endTime}`,
              label: `${startTime} - ${endTime}`,
              startTime,
              endTime,
            });
          }
        }
    
        setAvailableTimeSlots(slots);
    
        
        setValue("timeSlot", "");
      }, [selectedDate]);

      const isDayDisabled = (day) => {
        
        if (day < new Date()) {
          return true;
        }
    
        
        const dayOfWeek = format(day, "EEEE").toUpperCase();
    
        
        const daySchedule = dealership?.workingHours?.find(
          (schedule) => schedule.dayOfWeek === dayOfWeek
        );
    
       
        return !daySchedule || !daySchedule.isOpen;
      };







      const onSubmit = async (data) => {

        const selectedSlot = availableTimeSlots.find(
            (slot) => slot.id === data.timeSlot
          );
      
          if (!selectedSlot) {
            toast.error("Selected time slot is not available");
            return;
          }
     
        await bookTestDriveFn({
            tamadaId: tamada.id,
            bookingDate: format(data.date, "yyyy-MM-dd"),
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            notes: data.notes || "",
          });
      };

      const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        router.push(`/tamadas/${tamada.id}`);
      };
    
      
  return (
    <div>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     
      <div className="md:col-span-1">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">თამადის დეტალები</h2>

            <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
              {tamada.images && tamada.images.length > 0 ? (
                <img
                  src={tamada.images[0]}
                  alt={`${tamada.year} ${tamada.name} ${tamada.city}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Wine className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold">
              {tamada.name} -  {tamada.city} - {tamada.year}
            </h3>

            <div className="mt-2 text-xl font-bold text-red-600">
              {tamada.price.toLocaleString()  } &#x20BE;
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <div className="flex justify-between py-1 border-b">
                <span>ჭიქების რაოდენობა</span>
                <span className="font-medium">
                  {tamada.drinks.toLocaleString()} ჭიქა
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>ღიპის ზომა</span>
                <span className="font-medium">{tamada.stomachSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>ჩაცმის სტილი</span>
                <span className="font-medium">{tamada.clothingStyle}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>იუმორის დონე</span>
                <span className="font-medium">{tamada.humorLevel}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>ღონისძიების ტიპი</span>
                <span className="font-medium">{tamada.eventTypes}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">საიტის შესახებ</h2>
            <div className="text-sm">
              <p className="font-medium">
                {dealership?.name || "თამადა"}
              </p>
              <p className="text-gray-600 mt-1">
                {dealership?.address || "მისამართი ვერ მოიძებნა"}
              </p>
              <p className="text-gray-600 mt-3">
                <span className="font-medium">ტელეფონი:</span>{" "}
                {dealership?.phone || "არ არის ხელმისაწვდომი"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">ელ-ფოსტა:</span>{" "}
                {dealership?.email || "არ არის ხელმისაწვდომი"}
              </p>
            </div>
          </CardContent>
        </Card>

       
        
      </div>


      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">დაჯავშნე შეხვედრა თამადასთან</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  აირჩიე თარიღი
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "აირჩიე თარიღი"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDayDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

             
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  აირჩიე დროის მონაკვეთი
                </label>
                <Controller
                  name="timeSlot"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          !selectedDate || availableTimeSlots.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDate
                                ? "გხთოვთ აირჩიეთ თარიღი"
                                : availableTimeSlots.length === 0
                                ? "დროის მონაკვეთი არ არის"
                                : "აირჩიე დროის მონაკვეთი"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.timeSlot && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          {errors.timeSlot.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>



              

          

              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                 დამატებითი ტექსტი (არჩევითი)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="გაქვს განსაკუთრებული მოთხოვნა შეხვედრამდე?"
                      className="min-h-24"
                    />
                  )}
                />
              </div>

           
              <Button
                type="submit"
                className="w-full"
                variant="destructive"
                disabled={bookingInProgress}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    მიმდინარეობს დაჯავშნა...
                  </>
                ) : (
                  "დაჯავშნე შეხვედრა.."
                )}
              </Button>
            </form>

            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">რას უნდა ელოდეთ</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  მოიტანეთ პირადობის მოწმობა
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  თამადასთან შეხვედრა გრძელდება დაახლოებით 40 წუთი
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                 ჩვენი წარმომადგენელი გაგიძღვებათ 
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>


      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              შეხვედრა თამადასთან დაიჯავშნა წარმატებით
            </DialogTitle>
            <DialogDescription>
              თამადასთან შეხვედრა დაინიშნა შემდეგი დეტალებით
            </DialogDescription>
          </DialogHeader>

          {bookingDetails && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">თამადა:</span>
                  <span>
                    {tamada.year} {tamada.name} {tamada.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">თარიღი:</span>
                  <span>{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">დროის მონაკვეთი:</span>
                  <span>{bookingDetails.timeSlot}</span>
                </div>
              
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-700">
                გთხოვთ მობრძანდეთ 10 წუთით ადრე 
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="destructive" onClick={handleCloseConfirmation}>დასრულება</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  )
}

export default MeetingForm
