import TamadaCard from "@/components/TamadaCard";
import { Button } from "@/components/ui/button";
import { tamadas } from "@/public/tamadas";

export default function Home() {
  return (
    <main className="px-12">
      <section className="relative py-16 md:py-28 texture ">
         <div className="max-w-4x mx-auto text-center ">
            <div>
              <h1 className="text-white text-5xl md:text-5xl max-w-4xl m-auto font-bold leading-[5rem]">იპოვეთ სასურველი თამადა ხელოვნური ინტელექტის დახმარებით</h1>

             <p className="text-red-500 bg-white w-120 m-auto rounded-md p-2 shadow-xl mt-12 ">გაახალისე შენი ქორწილი, ქელეხი ან დაბადების დღე</p>
            </div>
         </div>
      </section>


      <section className="py-12">
        <div>
          <div>
            <h2 className="border-b py-8 text-3xl text-slate-800 font-extrabold">ცნობილი თამადები</h2>
          </div>

          <div className="flex items-center gap-12">

          {tamadas.map((value) => (
            <TamadaCard key = {value.id} value = {value}/>
          ))}
          </div>
        </div>
      </section>
    </main>
  );
}
