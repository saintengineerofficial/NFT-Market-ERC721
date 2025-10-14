import { ethers, TransactionResponse } from "ethers"
import JSON from "@/artifacts/contracts/MK.sol/MK.json"
// import JSON from '@/ignition/deployments/chain-1029/artifacts/MK#MK.json'
import { EthereumProvider } from "hardhat/types"
import { EventParams, EventStruct, TicketStruct } from "@/lib/type.dt"
import { uploadEventMetadata, createEventMetadata, getMetadataFromIPFS } from "./metadata"

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
    // 1. 创建并上传元数据到IPFS
    const metadata = createEventMetadata({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      category: "Event", // 可以根据需要动态设置
      location: "TBD",
      language: "English",
      difficulty: "All Levels"
    })

    const metadataURI = await uploadEventMetadata(metadata)
    console.log("Event metadata uploaded to IPFS:", metadataURI)

    // 2. 调用智能合约，只传入业务逻辑必需的参数
    const contract = await getEthereumContract()
    tx = await contract.createEvent(
      metadataURI, // IPFS元数据URI
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
    // 1. 创建并上传新的元数据到IPFS
    const metadata = createEventMetadata({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      category: "Event",
      location: "TBD",
      language: "English",
      difficulty: "All Levels"
    })

    const metadataURI = await uploadEventMetadata(metadata)
    console.log("Updated event metadata uploaded to IPFS:", metadataURI)

    // 2. 调用智能合约更新
    const contract = await getEthereumContract()
    tx = await contract.updateEvent(
      event.id,
      metadataURI,
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

/**
 * 获取完整的活动数据（包括IPFS元数据）
 */
const getEventWithMetadata = async (eventId: number) => {
  try {
    // 1. 获取链上数据
    const event = await getSingleEvent(eventId)

    // 2. 从IPFS获取元数据并填充展示字段
    if (event.metadataURI && event.metadataURI.startsWith('ipfs://')) {
      const metadata = await getMetadataFromIPFS(event.metadataURI)
      return {
        ...event,
        metadata: metadata,
        title: metadata.name || "Unknown Event",
        description: metadata.description || "No description available",
        imageUrl: metadata.image || "",
      }
    }

    // 3. 如果没有metadataURI，返回默认数据
    return {
      ...event,
      title: "Unknown Event",
      description: "No description available",
      imageUrl: "",
    }
  } catch (error) {
    console.error("Failed to get event with metadata:", error)
    // 如果IPFS获取失败，返回默认数据
    const event = await getSingleEvent(eventId)
    return {
      ...event,
      title: "Unknown Event",
      description: "No description available",
      imageUrl: "",
    }
  }
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
      metadataURI: event.metadataURI || "",
      owner: event.owner,
      sales: Number(event.seats), // 销售量等于已售座位数
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
      // 这些字段将从IPFS元数据中获取
      title: "",
      imageUrl: "",
      description: "",
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

export { getEvents, getMyEvent, getSingleEvent, getEventWithMetadata, getTickets, createEvent, updateEvent, deleteEvent, buyTicket, payout }
