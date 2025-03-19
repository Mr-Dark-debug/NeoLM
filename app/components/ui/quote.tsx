"use client";

import DotPattern from "@/app/components/ui/dot-pattern";
import Link from "next/link";

export function Quote() {
  return (
    <div className="mx-auto max-w-7xl px-6 mb-10 md:mb-20 xl:px-0">
      <div className="relative flex flex-col items-center border border-purple-500/20 rounded-lg overflow-hidden">
        <DotPattern width={5} height={5} className="fill-purple-500/10" />
        <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-purple-500/20" />
        <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-purple-500/20" />
        <div className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-purple-500/20" />
        <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-purple-500/20" />
        <div className="relative z-20 mx-auto max-w-7xl rounded-[40px] py-6 md:p-10 xl:py-20">
          <p className="md:text-md text-xs text-purple-500 lg:text-lg xl:text-2xl">
          </p>
          <div className="text-2xl tracking-tighter md:text-5xl lg:text-7xl xl:text-8xl">
            <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
              <h1 className="font-semibold text-gray-900">"Think</h1>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-semibold">smarter</p>
            </div>
            <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
              <p className="font-thin text-gray-900">not</p>
              <h1 className="font-semibold text-gray-900">harder"</h1>
            </div>
          </div>
          <p className="mt-4 text-lg text-gray-600 md:mt-8 lg:mt-10 max-w-2xl">
            The ultimate tool for understanding the information that matters most to you, built with Gemini 2.0
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start md:mt-8">
            <Link 
              href="/dashboard" 
              className="bg-purple-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-purple-600 transition"
            >
              Try NeoLM
            </Link>
            <Link 
              href="https://github.com/yourusername/neolm" 
              target="_blank"
              className="bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quote; 