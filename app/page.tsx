import React from "react"
import Hero from "@/components/sections/Hero"
import Events from "@/components/sections/Events"

const Page = () => {
  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-10">
      <Hero></Hero>
      <Events></Events>
    </main>
  )
}

export default Page
