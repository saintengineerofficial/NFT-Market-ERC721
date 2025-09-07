import Link from "next/link"
import React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import BackgroundSection from "@/components/global/BackgroundSection"

const Hero = () => {
  return (
    <section className="w-full flex items-center py-7">
      <div className="relative pb-8 ">
        <div className="px-4">
          <div className="">
            <h1 className="text-4xl tracking-tight font-bold text-gray-900">
              <span className="block xl:inline text-[#010125]">Bring Events To The</span>
              <br />
              <span className="block text-orange-500 xl:inline"> Web3 Marketplace</span>
            </h1>

            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Welcome to Web3 event market place, create vibrant expositions conneting enthusiasts with experts,
              products and services in a decentralized anonymous enviroment.
            </p>

            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <Button asChild>
                <Link
                  href="/events/create"
                  className="bg-[#010125] p-2 rounded-full py-3 px-4 text-white 
                  border hover:bg-transparent hover:text-[#010125] hover:border-[#010125] duration-300 transition-all">
                  Add Events
                </Link>
              </Button>

              <Button
                className="bg-orange-500 p-2 py-3 px-4
                text-white mx-4 hover:bg-transparent border hover:text-orange-500
                hover:border-orange-500 duration-300 transition-all">
                Explore Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BackgroundSection imagePath="/hero.jpg" className="w-full h-100"></BackgroundSection>
    </section>
  )
}

export default Hero
