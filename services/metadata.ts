import { pinata } from "./pinata"

export interface EventMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties?: {
    category: string
    location: string
    language: string
    difficulty: string
  }
}

export interface TicketMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties?: {
    eventId: number
    eventName: string
    seatNumber?: string
    ticketType: string
  }
}

/**
 * 上传活动元数据到IPFS
 */
export const uploadEventMetadata = async (metadata: EventMetadata): Promise<string> => {
  try {
    const result = await pinata.upload.public.json(metadata)
    return `ipfs://${result.cid}`
  } catch (error) {
    console.error("Failed to upload event metadata:", error)
    throw new Error("Failed to upload event metadata to IPFS")
  }
}

/**
 * 上传票元数据到IPFS
 */
export const uploadTicketMetadata = async (metadata: TicketMetadata): Promise<string> => {
  try {
    const result = await pinata.upload.public.json(metadata)
    return `ipfs://${result.cid}`
  } catch (error) {
    console.error("Failed to upload ticket metadata:", error)
    throw new Error("Failed to upload ticket metadata to IPFS")
  }
}

/**
 * 从IPFS获取元数据
 */
export const getMetadataFromIPFS = async (ipfsUri: string): Promise<any> => {
  try {
    // 移除 ipfs:// 前缀，获取CID
    const cid = ipfsUri.replace("ipfs://", "")

    // 使用Pinata网关获取数据
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to get metadata from IPFS:", error)
    throw new Error("Failed to get metadata from IPFS")
  }
}

/**
 * 创建活动元数据
 */
export const createEventMetadata = (eventData: {
  title: string
  description: string
  imageUrl: string
  category?: string
  location?: string
  language?: string
  difficulty?: string
}): EventMetadata => {
  return {
    name: eventData.title,
    description: eventData.description,
    image: eventData.imageUrl,
    external_url: `https://yourapp.com/events/${eventData.title.toLowerCase().replace(/\s+/g, "-")}`,
    attributes: [
      { trait_type: "Category", value: eventData.category || "General" },
      { trait_type: "Location", value: eventData.location || "TBD" },
      { trait_type: "Language", value: eventData.language || "English" },
      { trait_type: "Difficulty", value: eventData.difficulty || "All Levels" },
    ],
    properties: {
      category: eventData.category || "General",
      location: eventData.location || "TBD",
      language: eventData.language || "English",
      difficulty: eventData.difficulty || "All Levels",
    },
  }
}

/**
 * 创建票元数据
 */
export const createTicketMetadata = (ticketData: {
  eventId: number
  eventName: string
  eventImage: string
  seatNumber?: string
  ticketType?: string
}): TicketMetadata => {
  return {
    name: `${ticketData.eventName} - Ticket`,
    description: `Official ticket for ${ticketData.eventName}`,
    image: ticketData.eventImage,
    attributes: [
      { trait_type: "Event ID", value: ticketData.eventId },
      { trait_type: "Event Name", value: ticketData.eventName },
      { trait_type: "Seat Number", value: ticketData.seatNumber || "General Admission" },
      { trait_type: "Ticket Type", value: ticketData.ticketType || "Standard" },
    ],
    properties: {
      eventId: ticketData.eventId,
      eventName: ticketData.eventName,
      seatNumber: ticketData.seatNumber,
      ticketType: ticketData.ticketType || "Standard",
    },
  }
}
