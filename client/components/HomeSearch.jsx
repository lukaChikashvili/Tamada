"use client"
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Camera, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { useDropzone } from 'react-dropzone'

const HomeSearch = () => {
   

    const [searchTerm, setSearchTerm] = useState('');
    const [isImageSearchActive, setIsImageSearchActive] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [searchImage, setSearchImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);


    const handleTextSubmit = () => {}
    const handleImageSearch = () => {}


    const onDrop = (acceptedFiles) => {
         // do somethibg
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
                {imagePreview ? <div></div> : (
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
            </form>
            </div>
      )}
    </div>
  )
}

export default HomeSearch
