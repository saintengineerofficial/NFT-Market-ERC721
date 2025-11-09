"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EventStruct } from "@/lib/type.dt"
import { buyTicket } from "@/services/blockchain"
import { toast } from "sonner"

type Props = {
  event: EventStruct
}

const Buy = ({ event }: Props) => {
  const [num, setNum] = useState("")
  const [open, setOpen] = useState(false)

  const handleClick = async () => {
    if (!num) return
    const loadingId = toast.loading("")
    try {
      const res = await buyTicket(event.id, +num)
      window.location.reload()
      console.log("🚀 ~ handleClick ~ res:", res)
      toast.success("")
      setOpen(false)
    } catch (error) {
      console.log("🚀 ~ handleClick ~ error:", error)
    } finally {
      toast.dismiss(loadingId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-30" onClick={() => setOpen(true)}>
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Label>Quantity</Label>
          <Input type="number" name="ticketNum" value={num} onChange={e => setNum(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleClick}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Buy
