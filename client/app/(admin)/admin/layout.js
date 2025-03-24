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
    <div>
        

        <div>
            <Sidebar />

        </div>

        <main className="md:pl-56 pt-[80px] h-full">
            {children}
        </main>
    </div>
  )
}

export default AdminLayout
