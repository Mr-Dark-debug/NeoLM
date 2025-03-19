import Image from "next/image";
import Link from "next/link";
import { Quote } from "./components/ui/quote";

export default function Home() {
  return (
    <div className="container mx-auto px-4 md:px-8">
      {/* Hero Section */}
      <section className="text-center py-20 max-w-7xl mx-auto">
        <Quote />
      </section>

      {/* AI Research Assistant Section */}
      <section className="py-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-16 text-center">
          Your personalised AI research assistant
        </h2>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Upload Sources Feature */}
          <div className="flex flex-col p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-3 p-3 bg-purple-100 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Upload your sources</h3>
            <p className="text-gray-600">
              Upload PDFs, websites, YouTube videos, audio files, Google Docs or 
              Google Slides and NeoLM will summarise them and make interesting 
              connections between topics, all powered by Gemini 2.0's multimodal 
              understanding capabilities.
            </p>
          </div>
          
          {/* Instant Insights Feature */}
          <div className="flex flex-col p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-3 p-3 bg-pink-100 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Instant insights</h3>
            <p className="text-gray-600">
              With all of your sources in place, NeoLM will go to work and
              become a personalized expert in the information that matters most to you.
            </p>
          </div>
          
          {/* See the Source Feature */}
          <div className="flex flex-col p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-3 p-3 bg-blue-100 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">See the source, not just the answer</h3>
            <p className="text-gray-600">
              Gain confidence in every response because NeoLM provides clear
              citations for its work, showing you the exact quotes from your
              sources.
            </p>
          </div>
          
          {/* Listen and Learn Feature */}
          <div className="flex flex-col p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-3 p-3 bg-amber-100 rounded-full w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Listen and learn on the go</h3>
            <p className="text-gray-600">
              Our new Audio Overview feature can turn your sources into engaging
              deep dive discussions with just one click.
            </p>
          </div>
        </div>
      </section>

      {/* How People Use Section */}
      <section className="py-16">
        <h2 className="text-3xl font-semibold mb-16 text-center">
          How people are using NeoLM
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-4 mx-auto w-14 h-14 flex items-center justify-center bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M8 7v7c0 2 1 3 3 3h5c2 0 3-1 3-3V7c0-2-1-3-3-3h-5C9 4 8 5 8 7z"></path>
                <path d="M8 18c-2 0-3-1-3-3V5"></path>
                <line x1="13" y1="4" x2="13" y2="7"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-3">Power study</h3>
            <p className="text-gray-600 mb-3">
              Upload lecture recordings, textbook chapters and research papers. Ask
              NeoLM to explain complex concepts in simple terms, provide
              real-world examples and reinforce your understanding.
            </p>
            <p className="text-gray-500 italic">Learn faster and deeper.</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-4 mx-auto w-14 h-14 flex items-center justify-center bg-pink-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-3">Organise your thinking</h3>
            <p className="text-gray-600 mb-3">
              Upload your source material and let NeoLM create a polished
              presentation outline, complete with key talking points and
              supporting evidence.
            </p>
            <p className="text-gray-500 italic">Present with confidence.</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white shadow-sm">
            <div className="mb-4 mx-auto w-14 h-14 flex items-center justify-center bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-3">Spark new ideas</h3>
            <p className="text-gray-600 mb-3">
              Upload brainstorming notes, market research and competitor
              research. Ask NeoLM to identify trends, generate new product 
              ideas and uncover hidden opportunities.
            </p>
            <p className="text-gray-500 italic">Unlock your creative potential.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <h2 className="text-3xl font-semibold mb-16 text-center">
          What people are saying
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 italic mb-6">
              "It's one of the most compelling and completely flabbergasting
              demonstrations of AI's potential yet."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                WSJ
              </div>
              <span className="font-medium">WSJ</span>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 italic mb-6">
              "NeoLM is a beautiful way to walk through information space"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center mr-3">
                TV
              </div>
              <span className="font-medium">The Verge</span>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 italic mb-6">
              "It's possible the podcast episode touching on a variety of
              highly complex formats. May be revolutionary."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                A
              </div>
              <span className="font-medium">Andrej</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}