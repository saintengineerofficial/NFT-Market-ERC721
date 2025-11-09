"use client"
import { EventStruct } from "@/lib/type.dt"
import React from "react"
import { useAccount } from "wagmi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteEvent, payout } from "@/services/blockchain"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = {
  event: EventStruct
}

const items = [
  { id: 1, label: "edit" },
  { id: 2, label: "Payout" },
  { id: 3, label: "Delete" },
]

const OwnerMore = ({ event }: Props) => {
  const { address } = useAccount()
  const router = useRouter()
  console.log("🚀 ~ OwnerMore ~ event:", event)

  const handleClick = async (val: number) => {
    const eventId = event.id
    if (val === 3) {
      if (!event.paidOut) {
        return toast.warning("no payout")
      }
      await deleteEvent(eventId)
      router.push("/")
    }
    if (val === 2) {
      await payout(eventId)
      toast.success("success payout")
    }
  }

  if (address !== event.owner) return null

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>More</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map(item => (
            <DropdownMenuItem
              disabled={item.id === 2 && event.paidOut}
              key={item.id}
              onClick={() => handleClick(item.id)}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default OwnerMore
