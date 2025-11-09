import BackgroundSection from "@/components/global/BackgroundSection"
import { getSingleEvent, getTickets } from "@/services/blockchain"
import { BadgeEuro } from "lucide-react"
import React from "react"
import Buy from "./_components/Buy"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dayjs, { Dayjs } from "dayjs"
import { useAccount } from "wagmi"
import OwnerMore from "./_components/OwnerMore"

type Props = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: Props) => {
  const id = (await params).id
  const eventSingleData = await getSingleEvent(+id)
  const tickets = await getTickets(+id)
  console.log("🚀 ~ Page ~ tickets:", tickets)

  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-4">
      <BackgroundSection imagePath={eventSingleData.imageUrl} className="w-full h-150 object-contain rounded-2xl" />
      <h1 className="scroll-m-20 text-left text-4xl font-extrabold tracking-tight text-balance">
        {eventSingleData.title}
      </h1>
      <div>
        Remaining amount :{eventSingleData.capacity}/{eventSingleData.capacity - eventSingleData.seats}
        <br />
        Start On : {dayjs(eventSingleData.startsAt * 1000).format("YYYY-MM-DD HH:mm:ss")}
      </div>
      <article>{eventSingleData.description}</article>
      <div className="flex items-center gap-3">
        <BadgeEuro />
        <p>{eventSingleData.ticketCost}ETH</p>
      </div>
      <div className="flex items-center gap-3">
        <Buy event={eventSingleData}></Buy>
        <OwnerMore event={eventSingleData}></OwnerMore>
      </div>

      <div>
        <h1 className="text-3xl mb-3">Recent Purchase({tickets.length})</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>id</TableHead>
              <TableHead>owner</TableHead>
              <TableHead>cost</TableHead>
              <TableHead className="text-right">time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.eventId}</TableCell>
                <TableCell>{ticket.owner}</TableCell>
                <TableCell>{ticket.ticketCost}ETH</TableCell>
                <TableCell className="text-right">{dayjs(ticket.timestamp).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}

export default Page
