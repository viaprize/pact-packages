import Link from 'next/link';
import React from 'react'
import Image from 'next/image';

const header =[
    {
        label: "Explore",
        href: "#",
        
      },
      {
        label: "About",
        href: "#",
        
      },
      {
        label: "Contact",
        href: "#",
        
      },
     
]




export default function Header(){
  return (
    <div className="flex h-[60px] w-full items-center justify-between bg-neutral-50 px-5 dark:bg-neutral-800">
      <Image
        src="/viaprizeBg.png"
        alt="Acet Labs"
        className="h-10 w-10 flex-shrink-0 rounded-full"
        width={50}
        height={50}
      />
      <div className="flex items-center justify-between space-x-7 font-semibold">
        {header.map((item, index) => (
          <Link key={index} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="">
        <div className="relative flex  w-full items-center overflow-hidden rounded-2xl p-2 focus-within:shadow-lg border">
          <div className="grid h-full w-12 place-items-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="gray"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            className="peer h-full w-full pr-2 text-sm text-gray-700 outline-none"
            type="text"
            id="search"
            placeholder="Search something.."
          />
        </div>
      </div>
    </div>
  );
}
