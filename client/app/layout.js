import {  Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({subsets: ["latin"]});



export const metadata = {
  title: "Tamada",
  description: "Choose your tamada",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
    <head>
        <link
          rel="stylesheet"
          href="https://cdn.web-fonts.ge/fonts/arial-geo/css/arial-geo.min.css"
        />
      </head>
      <body
        className={`${inter.className}`}
      >
        <Header />
        <main className="min-h-screen   "> 
        {children}
        </main>

        <Toaster richColors />
      </body>
    </html>
    </ClerkProvider>
  );
}
