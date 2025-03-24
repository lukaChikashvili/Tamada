"use client"
import { cn } from '@/lib/utils'
import { SignOutButton } from '@clerk/nextjs'
import { Calendar, Cog, LayoutDashboard, LogOut, Wine } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Sidebar = () => {
    
    const routes = [
        {
            label: "პანელი",
            icon: LayoutDashboard,
            href: "/admin"
        },
        {
            label: "თამადები",
            icon: Wine,
            href: "/admin/tamadas"
        },

        {
            label: "შეხვედრები",
            icon: Calendar,
            href: "/admin/meetings"
        },

        {
            label: "პარამეტრები",
            icon: Cog,
            href: "/admin/settings"
        }
    ];

    const pathname = usePathname();

  return (
  <>
       <div className="hidden md:flex h-full flex-col overflow-y-auto bg-white shadow-sm border-r">
        <div className="p-6">
          <Link href="/admin">
            <h1 className="text-xl font-bold">თამადა ადმინი</h1>
          </Link>
        </div>
        <div className="flex flex-col w-full">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50",
                pathname === route.href
                  ? "text-red-500 bg-blue-100/50 hover:bg-blue-100 hover:text-red-700"
                  : "",
                "h-12"
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto p-6">
          <SignOutButton>
            <button className="flex items-center gap-x-2 text-slate-500 text-sm font-medium transition-all hover:text-slate-600">
              <LogOut className="h-5 w-5" />
              გასვლა
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center text-slate-500 text-xs font-medium transition-all",
              pathname === route.href ? "text-red-700" : "",
              "py-1 flex-1"
            )}
          >
            <route.icon
              className={cn(
                "h-6 w-6 mb-1",
                pathname === route.href ? "text-red-700" : "text-slate-500"
              )}
            />
            {route.label}
          </Link>
        ))}
      </div>
  </>
  )
}

export default Sidebar
