"use client"
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Camera } from 'lucide-react'

const HomeSearch = () => {
    const handleTextSubmit = () => {}

    const [searchTerm, setSearchTerm] = useState('');
    const [isImageSearchActive, setIsImageSearchActive] = useState(false);

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
       <div className='relative flex items-center'>
        <Input 
        type = "text" 
        placeholder = "ჩაწერეთ სახელი, ადგილი ან გამოიყენეთ AI"
        value ={searchTerm} 
        onChange = {(e) => setSearchTerm(e.target.value)}
        className="w-full m-auto bg-white" />

        <div className='absolute right-20'>
        <Camera size = {35} 
                onClick={() => setIsImageSearchActive(!isImageSearchActive)} 
                className='cursor-pointer rounded-xl p-1.5'
                style = {{
                    background: isImageSearchActive ? "red": "",
                    color: isImageSearchActive ? "white" : ""
                }} />
        </div>
       </div>
     
      </form>
    </div>
  )
}

export default HomeSearch
