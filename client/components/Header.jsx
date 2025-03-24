import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import logo from '../public/logo.png'
import { Heart, Layout, LogIn, User } from 'lucide-react'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser'

const Header = async ({ isAdminPage = false}) => {

  const user = await checkUser();

  const isAdmin = user?.role === "ADMIN";


  return (
    <header className=' top-0 w-full backdrop-blur-md z-50 border-b'>
       <nav className='mx-auto px-12 py-4 flex items-center justify-between'>
         <Link href = {isAdminPage ? "/admin" : "/"}>
            <Image src = {logo}
                   alt = "logo"
                   width = {100}
                   height = {30}

            />
             {isAdminPage && (
            <span className="text-xs font-extralight">admin</span>
          )}
         </Link>

         <div className='flex gap-4'>
          <SignedIn>
             <Link href = "saved-tamadas">
              <Button variant="outline" className='flex gap-4 cursor-pointer'>
                <User />
                <span className='hidden md:inline'>დაჯავშნილი თამადები</span>
                </Button></Link>

                <Link href = "saved-tamadas">
              <Button variant="destructive" className='flex gap-4 cursor-pointer'>
                <Heart />
              <span className='hidden md:inline'>შენახული თამადები</span>
                </Button></Link>

                {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Layout size={18} />
                    <span className="hidden md:inline">პორტალი</span>
                  </Button>
                </Link>
              )}
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl='/'>
               <Button variant="destructive" className="cursor-pointer"> <LogIn />შესვლა</Button>
            </SignInButton>
          </SignedOut>

    
          <SignedIn>
            <UserButton appearance={
              {
                elements: {
                 avatarImage: "w-36 h-36"
                }
              }
            } />
          </SignedIn>
       
         </div>
        
       </nav>
    </header>
  )
}

export default Header
