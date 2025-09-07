import { getEvents, getTickets } from "@/services/blockchain"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const Events = async () => {
  const eventsData = await getEvents()
  return (
    <section className="">
      <div className="grid grid-cols-3 gap-5 container">
        {eventsData.map(event => {
          return (
            <Link key={event.id} href={`events/${event.id}`}>
              <Card className="w-full h-full min-h-40 p-0 pb-10">
                <div className="relative w-full h-40">
                  <Image src={event.imageUrl} fill alt="image" className="object-cover"></Image>
                </div>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <CardTitle>{event.title}</CardTitle>
                    <span>{event.description}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default Events
