import BackgroundSection from "@/components/global/BackgroundSection"
import { Button } from "@/components/ui/button"
import { getSingleEvent } from "@/services/blockchain"
import { BadgeEuro } from "lucide-react"
import React from "react"
import Buy from "./_components/Buy"

type Props = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: Props) => {
  const id = (await params).id
  const eventSingleData = await getSingleEvent(+id)

  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-4">
      <BackgroundSection imagePath={eventSingleData.imageUrl} className="w-full h-150 object-contain rounded-2xl" />
      <h1 className="scroll-m-20 text-left text-4xl font-extrabold tracking-tight text-balance">
        {eventSingleData.title}
      </h1>
      <article>{eventSingleData.description}</article>
      <div className="flex items-center gap-3">
        <BadgeEuro />
        <p>{eventSingleData.ticketCost}ETH</p>
      </div>
      <Buy event={eventSingleData}></Buy>
    </main>
  )
}

export default Page
