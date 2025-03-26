import { getAdmin } from '@/actions/admin'
import Header from '@/components/Header';
import { notFound } from 'next/navigation';
import React from 'react'
import Sidebar from './_components/Sidebar';

const AdminLayout = async ({ children }) => {

    const admin = await getAdmin();

    if(!admin.authorized) {
        return notFound();
    }
  return (
    <div className='flex items-start w-full '>
  
    <div className="flex h-full w-56 items-start top-20 z-50">
      <Sidebar />
    </div>

    
    <main className="flex-1 md:pl-56 pt-[80px] h-full px-12">
      {children}
    </main>
  </div>
  )
}

export default AdminLayout
