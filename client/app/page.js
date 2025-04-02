import { getFeaturedTamadas } from "@/actions/home";
import HomeSearch from "@/components/HomeSearch";
import TamadaCard from "@/components/TamadaCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqData } from "@/public/faq";
import { restaurants } from "@/public/restaurants";
import { SignedOut } from "@clerk/nextjs";
import {  ChevronRight, Wine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {

  const featuredTamadas = await getFeaturedTamadas();
  return (
    <main className="px-12">
      <section className="relative py-16 md:py-28 texture ">
         <div className="max-w-4x mx-auto text-center ">
            <div>
              <h1 className="text-white text-5xl md:text-5xl max-w-4xl m-auto font-bold leading-[5rem]">იპოვეთ სასურველი თამადა ხელოვნური ინტელექტის დახმარებით</h1>

             <p className="text-red-500 bg-white w-120 m-auto rounded-md p-2 shadow-xl mt-12 ">გაახალისე შენი ქორწილი, ქელეხი ან დაბადების დღე</p>
            </div>
            <div className="w-1/2 m-auto mt-8">
            <HomeSearch />
            </div>
         </div>
      </section>


      <section className="py-12">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="border-b py-8 text-3xl text-slate-800 font-extrabold">ცნობილი თამადები</h2>
            <Link href = "/tamadas">
            <Button variant="ghost" className="cursor-pointer">ყველას ნახვა <ChevronRight /></Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">

          {featuredTamadas.map((value) => (
            <TamadaCard key = {value.id} value = {value}/>
          ))}
          </div>
        </div>
      </section>


      <section className="py-12">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="border-b py-8 text-3xl text-slate-800 font-extrabold">მოძებნე რესტორანით</h2>
          <Link href = "/tamadas">
          <Button  variant="ghost" className="cursor-pointer" >ყველას ნახვა <ChevronRight /></Button>
          </Link>  
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 ">
  {restaurants.map((value) => (
    <div
      key={value.id}
      className="w-[350px] h-[200px] relative overflow-hidden rounded-md group"
    >
      <Image
        src={value.img}
        alt={value.name}
        layout="fill"
        objectFit="cover"
        className="rounded-md shadow-xl cursor-pointer transition-transform duration-300 ease-in-out group-hover:scale-105"
      />
      <h2>{value.name}</h2>
    </div>
  ))}
</div>
</div>
      </section>

      <section className="mt-12 py-16 bg-gradient-to-b from-red-100 to-white">
  <div className="container mx-auto px-6 flex flex-col items-center gap-12">
  
    <h2 className="text-3xl md:text-4xl font-extrabold text-red-600 text-center">
      რატომ უნდა აგვირჩიოთ?
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
     
      {[
        {
          icon: <Wine size={80} className="text-white" />,
          title: "პროფესიონალი თამადები",
          text: "ჩვენს პლატფორმაზე მხოლოდ გამოცდილი და ტრადიციებში გათვითცნობიერებული თამადები არიან რეგისტრირებული.",
        },
        {
          icon: <Wine size={80} className="text-white" />,
          title: "უნიკალური გამოცდილება",
          text: "თითოეული თამადა თქვენს ღონისძიებას დაუვიწყარ და ემოციურ მომენტად გადააქცევს.",
        },
        {
          icon: <Wine size={80} className="text-white" />,
          title: "ჭკვიანი შერჩევა",
          text: "ჩვენი პლატფორმა იყენებს AI-ს, რათა თქვენს საჭიროებებზე მორგებული საუკეთესო თამადა შეარჩიოს.",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center bg-white shadow-lg rounded-xl p-8 transition-all duration-300 hover:scale-105"
        >
         
          <div className="bg-red-500 rounded-full p-4 flex items-center justify-center w-[90px] h-[90px] mb-4 shadow-lg">
            {item.icon}
          </div>
         
          <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
          
          <p className="text-lg text-slate-600 mt-2">{item.text}</p>
        </div>
      ))}
    </div>
  </div>
</section>



<section className="py-12 ">

  <div className="container mx-auto px-4">
  <h2 className="border-b py-8 text-3xl text-slate-800 font-extrabold">ხშირად დასმული კითხვები</h2>
   
   <Accordion type = "single" collapsible className = "w-full ">
    {faqData.map((faq, index) => (
       <AccordionItem key = {index} value = {`item-${index}`}>
       <AccordionTrigger className="text-xl text-slate-600 cursor-pointer transition duration-300  hover:text-red-400">{faq.question}</AccordionTrigger>
       <AccordionContent className="text-xl cursor-pointer">
         {faq.answer}
       </AccordionContent>
</AccordionItem>
    ))}
    
   </Accordion>


  </div>
</section>

<section className="py-12 texture text-center">
  <div className="container mx-auto px-4 flex flex-col gap-4">
     <h2 className="text-3xl text-white font-bold">მზად ხარ სასურველი თამადა იპოვო?</h2>

     <p className="text-xl text-slate-900">შეურთდი ათასზე მეტ კმაყოფილ მომხმარებელს, რომლებმაც სასურველი თამადა წამებში აარჩიეს</p>

     <div className="flex flex-col md:flex-row justify-center gap-4">
       <Button variant="outline">
          <Link href = "/tamadas">იხილეთ ყველა თამადა</Link>
       </Button>

       <SignedOut>
       <Button >
          <Link href = "/sign-up">დარეგისტრირდი ახლავე</Link>
       </Button>

       </SignedOut>
     </div>
  </div>
</section>

    </main>
  );
}
