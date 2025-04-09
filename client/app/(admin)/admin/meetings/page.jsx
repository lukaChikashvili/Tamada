import {MeetingsList} from "./_components/MeetingsList";

export const metadata = {
    title: "შეხვედრები | თამადა ადმინი",
   
  };
  
  export default function MeetingsPage() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">თამადის შეხვედრის ჯავშნები</h1>
        <MeetingsList />
      </div>
    );
  }