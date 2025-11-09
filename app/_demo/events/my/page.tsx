import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyEvent, getTickets } from "@/services/blockchain"
import BackgroundSection from "@/components/global/BackgroundSection"

const Page = async () => {
  const events = await getMyEvent()
  return (
    <main className="max-w-7xl mx-auto">
      <section className="flex flex-col gap-4">
        {events.map(event => {
          return (
            <Card key={event.id} className="w-full h-full">
              <CardContent className=" flex gap-4">
                <BackgroundSection
                  imagePath={event.imageUrl}
                  className="h-40 w-80 object-contain rounded-2xl"></BackgroundSection>
                <div className="flex flex-col gap-2">
                  <CardTitle>{event.title}</CardTitle>
                  <article>{event.description}</article>
                  <p>Cost:{}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </main>
  )
}

export default Page
