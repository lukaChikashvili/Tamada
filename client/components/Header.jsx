import { SignOutButton, SignedIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import logo from '../public/logo.png'
import { User } from 'lucide-react'
import { Button } from './ui/button'

const Header = () => {
  return (
    <header className='fixes top-0 w-full backdrop-blur-md z-50 border-b'>
       <nav className='mx-auto px-12 py-4 flex items-center justify-between'>
         <Link href = "/">
            <Image src = {logo}
                   alt = "logo"
                   width = {100}
                   height = {30}

            />
         </Link>

         <div>
          <SignedIn>
             <Link href = "saved-tamadas">
              <Button variant="destructive" className='flex gap-4 cursor-pointer'>
                <User />
              შენახული თამადები
                </Button></Link>
          </SignedIn>
         </div>
       </nav>
    </header>
  )
}

export default Header
