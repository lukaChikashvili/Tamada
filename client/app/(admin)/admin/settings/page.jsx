import { SettingsForm } from "./_components/SettingsForm";


export const metadata = {
    title: "პარამეტრები | თამადა ადმინი",
   
  };
  

export default function SettingsPage() {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">პარამეტრები</h1>
        <SettingsForm />
      </div>
    );
  }