"use client"
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Camera, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'


const HomeSearch = () => {
   

    const [searchTerm, setSearchTerm] = useState('');
    const [isImageSearchActive, setIsImageSearchActive] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [searchImage, setSearchImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const router = useRouter();

    const handleTextSubmit = (e) => {
      e.preventDefault();

      if(!searchTerm.trim()) {
        toast.error("გთხოვთ ჩაწეროთ საძიებო სიტყვა");
            return;
      }

      router.push(`/tamadas/search=${encodeURIComponent(searchTerm)}`);
    }
    const handleImageSearch = async (e) => {
        e.preventDefault();

        if(!searchImage) {
            toast.error("გთხოვთ ჯერ ატვირთოდ სურათი");
            return;
        }
    }


    const onDrop = (acceptedFiles) => {
         const file = acceptedFiles[0];

         if(file) {
            if(file.size > 5 * 1024 * 1024) {
                toast.error("სურათის ზომა  უნდა იყოს 5 მეგაბაიტზე ნაკლები");
                return;
            }

            setIsUploading(true);
            setSearchImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setIsUploading(false);
                toast.success('სურათი აიტვირთა წარმატებით');
            }

            reader.onerror = () => {
                
                setIsUploading(false);
                toast.error('სურათის წაკითხვა ვერ მოხერხდა');
            }

            reader.readAsDataURL(file);
         }
      };

      const {getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png"],
           
        },

        maxFiles: 1
    })

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
       <div className='relative flex items-center'>
        <Input 
        type = "text" 
        placeholder = "ჩაწერეთ სახელი, ადგილი ან გამოიყენეთ AI"
        value ={searchTerm} 
        onChange = {(e) => setSearchTerm(e.target.value)}
        className="w-full m-auto rounded-xl bg-white py-5" />

        <div className='absolute right-24'>
        <Camera size = {35} 
                onClick={() => setIsImageSearchActive(!isImageSearchActive)} 
                className='cursor-pointer rounded-xl p-1.5'
                style = {{
                    background: isImageSearchActive ? "red": "",
                    color: isImageSearchActive ? "white" : ""
                }} />
        </div>

        <Button variant = "destructive" className="absolute right-2 rounded-full ">
            ძებნა
        </Button>
       </div>
     
      </form>


      {isImageSearchActive && (
         <div className='mt-4'>
            <form onSubmit = {handleImageSearch}>
              <div className='bg-gray-200 rounded-lg shadow-lg p-6'>
                {imagePreview ? <div className='flex flex-col items-center gap-4'>
                    <img src = {imagePreview} alt = "img preview" className='h-40 object-contain mb-4 shadow-lg rounded-md' />
                    <Button variant="outline"
                    className="cursor-pointer" 
                     onClick = {() => {
                        setSearchImage(null);
                        setImagePreview("");
                        toast.info("სურათი წაიშალა");
                     }}
                    >წაშალეთ სურათი</Button>
                </div> : (
                    <div {...getRootProps()} className='flex flex-col items-center gap-4'>
                    <input {...getInputProps()} />
                    <Upload className='h-12 w-12 text-red-400  ' />
                    <p>
                   {isDragActive && !isDragReject ? 
                   "აქ დატოვეთ ფაილი ასატვირთად" :
                   "ჩააგდეთ თამადის სურათი ან დააჭირეთ ასარჩევად" }
                   </p>

                   {isDragReject && (
                     <p className='text-red-500 mb-2'>არასწორი სურათის ტიპი</p>
                   )}
                  </div>
                )}
              </div>

              {imagePreview && <Button variant="outline" type ="submit" className="w-full mt-2 cursor-pointer" disabled = {isUploading} >
                 {isUploading ? "იტვირთება..." : "ამ სურათით ძებნა"}
                </Button>}
            </form>
            </div>
      )}
    </div>
  )
}

export default HomeSearch
