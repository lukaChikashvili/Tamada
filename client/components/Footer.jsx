import Image from 'next/image';
import React from 'react';
import logo from '../public/logo.png';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-10 px-6 shadow-md mt-4  bg-gradient-to-b from-red-100 to-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">

        
        <div className="flex-shrink-0">
          <Image src={logo} alt="logo" width={100} height={100} className="object-contain" />
        </div>

        
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-lg mb-2">კონტაქტი</p>
          <p>📍 კორნელი გაგუას ქუჩა, 12</p>
          <p>📞 ტელეფონი: 569 55 98 43</p>
          <p>✉️ ელ-ფოსტა: contact@tamada.com</p>
        </div>
      </div>

    
      <div className="text-center text-xs text-gray-500 mt-10">
        © {new Date().getFullYear()} თამადა. ყველა უფლება დაცულია.
      </div>
    </footer>
  );
};

export default Footer;
