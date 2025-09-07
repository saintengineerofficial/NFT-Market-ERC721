import { EventStruct, TicketStruct } from '@/lib/type.dt'
import { create } from 'zustand'

interface IEventStore{
    events:EventStruct[]
    setEvents:(events:EventStruct[])=>void

    tickets:TicketStruct[]
    setTickets:(ticket:TicketStruct[])=>void
}

export const useStore = create<IEventStore>((set) => ({
    events:[],
    tickets:[],
    setEvents:(events:EventStruct[])=>set(()=>({events})),
    setTickets:(tickets:TicketStruct[])=>set(()=>({tickets})),
}))
