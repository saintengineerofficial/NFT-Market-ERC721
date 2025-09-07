"use client"
import Link from "next/link"
import React, { useState } from "react"
import { Button } from "../ui/button"
import { CircleX, Menu } from "lucide-react"
import ConnectBtn from "../ConnectBtn"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <header className="h-20 shadow-md p-5 sm:px-0 fixed z-50 top-0 right-0 left-0 bg-white">
      <main className="max-w-7xl w-full mx-auto flex justify-between items-center flex-wrap">
        <Link href="/" className="text-lg font-bold">
          SAINT NFT MK
        </Link>
        <div className="hidden sm:flex justify-end items-center space-x-2 md:space-x-4 mt-2 md:mt-0">
          <Link href="/events/create" className="text-md hover:text-orange-500 duration-300 transition-all">
            Create
          </Link>
          <Link href="/events/my" className="text-md hover:text-orange-500 duration-300 transition-all">
            Personal
          </Link>

          <ConnectBtn networks />
        </div>

        <div className="sm:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu size={25} />
          </button>
          {isOpen && (
            <div
              className="flex flex-col space-y-4 fixed top-0 right-0 h-full w-64 bg-white 
            shadow-md p-4 transition duration-500 ease-in-out transform-all">
              <div className="flex justify-end">
                <Button onClick={() => setIsOpen(!isOpen)}>
                  <CircleX size={25} />
                </Button>
              </div>

              <Link
                href="/events/create"
                className="text-md hover:text-orange-500 duration-300 transition-all block py-1">
                Create
              </Link>
              <Link
                href="/events/personal"
                className="text-md hover:text-orange-500 duration-300 transition-all block py-1">
                Personal
              </Link>
              <ConnectBtn />
            </div>
          )}
        </div>
      </main>
    </header>
  )
}

export default Header
