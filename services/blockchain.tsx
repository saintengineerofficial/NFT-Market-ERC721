import { ethers, TransactionResponse } from "ethers"
import JSON from "@/artifacts/contracts/MK.sol/MK.json"
// import JSON from '@/ignition/deployments/chain-1029/artifacts/MK#MK.json'
import { EthereumProvider } from "hardhat/types"
import { EventParams, EventStruct, TicketStruct } from "@/lib/type.dt"

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: number) => ethers.formatEther(num)

const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
let ethereum: EthereumProvider
let tx: TransactionResponse

if (typeof window !== "undefined") ethereum = window.ethereum

// 获取合约
const getEthereumContract = async () => {
  const accounts = (await ethereum?.request({ method: "eth_accounts" })) as string[]
  if (accounts?.length > 0) {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const contracts = new ethers.Contract(address, JSON.abi, signer)
    await contracts.waitForDeployment()
    return contracts
  } else {
    // 本地
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
    // const wallet = ethers.Wallet.createRandom()
    // const signer = wallet.connect(provider) // 创建随机钱包，没有eth
    const signer = await provider.getSigner(19) // 使用19号钱包
    const contracts = new ethers.Contract(address, JSON.abi, signer)
    await contracts.waitForDeployment()
    return contracts
  }
}

const createEvent = async (event: EventParams) => {
  if (!ethereum) {
    reportError("Please install a browser provider")
    return Promise.reject(new Error("Browser provider not installed"))
  }

  try {
    const contract = await getEthereumContract()
    tx = await contract.createEvent(
      event.title,
      event.description,
      event.imageUrl,
      event.capacity,
      toWei(Number(event.ticketCost)),
      event.startsAt,
      event.endsAt
    )
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const updateEvent = async (event: EventParams) => {
  if (!ethereum) {
    reportError("Please install a browser provider")
    return Promise.reject(new Error("Browser provider not installed"))
  }

  try {
    const contract = await getEthereumContract()
    tx = await contract.updateEvent(
      event.id,
      event.title,
      event.description,
      event.imageUrl,
      toWei(Number(event.ticketCost)),
      event.startsAt,
      event.endsAt
    )
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const deleteEvent = async (eventId: number) => {
  if (!ethereum) {
    reportError("Please install a browser provider")
    return Promise.reject(new Error("Browser provider not installed"))
  }

  try {
    const contract = await getEthereumContract()
    tx = await contract.deleteEvent(eventId)
    await tx.wait()

    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

// 获取所有活动
const getEvents = async (): Promise<EventStruct[]> => {
  const contract = await getEthereumContract()
  const events = await contract.getEvents()
  console.log("🚀 ~ getEvents ~ events:", events)
  return structEvent(events)
}

const getMyEvent = async (): Promise<EventStruct[]> => {
  const contract = await getEthereumContract()
  const events = await contract.getMyEvents()
  console.log("🚀 ~ getEvents ~ events:", events)
  return structEvent(events)
}

const getSingleEvent = async (eventId: number): Promise<EventStruct> => {
  const contract = await getEthereumContract()
  const event = await contract.getSingleEvent(eventId)
  return structEvent([event])[0]
}

const buyTicket = async (eventId: number, ticketNum: number) => {
  if (!ethereum) {
    reportError("Please install a browser provider")
    return Promise.reject(new Error("Browser provider not installed"))
  }

  try {
    const contract = await getEthereumContract()
    const event = await getSingleEvent(eventId)
    tx = await contract.buyTickets(eventId, ticketNum, { value: toWei(ticketNum * event.ticketCost) })
    tx.wait()

    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

const getTickets = async (eventId: number) => {
  const contract = await getEthereumContract()
  const tickets = await contract.getTickets(eventId)
  return structTickets(tickets)
}

const payout = async (eventId: number) => {
  if (!ethereum) {
    reportError("Please install a browser provider")
    return Promise.reject(new Error("Browser provider not installed"))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.payOut(eventId)
    tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

// 数据转换
const structEvent = (events: EventStruct[]): EventStruct[] =>
  events
    .map(event => ({
      id: Number(event.id),
      title: event.title,
      imageUrl: event.imageUrl,
      description: event.description,
      owner: event.owner,
      sales: Number(event.sales),
      ticketCost: parseFloat(fromWei(event.ticketCost)),
      capacity: Number(event.capacity),
      seats: Number(event.seats),
      startsAt: Number(event.startsAt),
      endsAt: Number(event.endsAt),
      timestamp: Number(event.timestamp),
      deleted: event.deleted,
      paidOut: event.paidOut,
      refunded: event.refunded,
      minted: event.minted,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

const structTickets = (tickets: TicketStruct[]): TicketStruct[] =>
  tickets
    .map(ticket => ({
      id: Number(ticket.id),
      eventId: Number(ticket.eventId),
      owner: ticket.owner,
      ticketCost: parseFloat(fromWei(ticket.ticketCost)),
      timestamp: Number(ticket.timestamp),
      refunded: ticket.refunded,
      minted: ticket.minted,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

export { getEvents, getMyEvent, getSingleEvent, getTickets, createEvent, updateEvent, deleteEvent, buyTicket, payout }
