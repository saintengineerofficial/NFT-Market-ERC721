// 跨链服务配置
export interface CrossChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  lzEndpoint: string;
  contractAddress: string;
  isTestnet: boolean;
}

// 支持的跨链网络配置
export const CROSS_CHAIN_NETWORKS: CrossChainConfig[] = [
  // 测试网
  {
    chainId: 5,
    name: "Goerli",
    rpcUrl: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
    lzEndpoint: "0xbfD2135BFfbb0B6668E3531c5Ae19138b0dA7361",
    contractAddress: "", // 部署后填入
    isTestnet: true
  },
  {
    chainId: 97,
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    lzEndpoint: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
    contractAddress: "", // 部署后填入
    isTestnet: true
  },
  {
    chainId: 80001,
    name: "Mumbai",
    rpcUrl: "https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY",
    lzEndpoint: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8",
    contractAddress: "", // 部署后填入
    isTestnet: true
  },
  {
    chainId: 43113,
    name: "Fuji",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    lzEndpoint: "0x93f54DcA3C7432D0b8b6Cfa82e5D3c43b2f8b0e1",
    contractAddress: "", // 部署后填入
    isTestnet: true
  },
  {
    chainId: 421613,
    name: "Arbitrum Goerli",
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    lzEndpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
    contractAddress: "", // 部署后填入
    isTestnet: true
  },
  {
    chainId: 420,
    name: "Optimism Goerli",
    rpcUrl: "https://goerli.optimism.io",
    lzEndpoint: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
    contractAddress: "", // 部署后填入
    isTestnet: true
  },
  // 主网
  {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    lzEndpoint: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
    contractAddress: "", // 部署后填入
    isTestnet: false
  },
  {
    chainId: 56,
    name: "BSC",
    rpcUrl: "https://bsc-dataseed.binance.org",
    lzEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    contractAddress: "", // 部署后填入
    isTestnet: false
  },
  {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY",
    lzEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    contractAddress: "", // 部署后填入
    isTestnet: false
  },
  {
    chainId: 43114,
    name: "Avalanche",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    lzEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    contractAddress: "", // 部署后填入
    isTestnet: false
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    lzEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    contractAddress: "", // 部署后填入
    isTestnet: false
  },
  {
    chainId: 10,
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    lzEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    contractAddress: "", // 部署后填入
    isTestnet: false
  }
];

// 跨链消息类型
export enum CrossChainMessageType {
  CREATE_EVENT = 0,
  UPDATE_EVENT = 1,
  BUY_TICKET = 2,
  DELETE_EVENT = 3,
  PAYOUT_EVENT = 4
}

// 跨链事件数据结构
export interface CrossChainEvent {
  id: number;
  metadataURI: string;
  owner: string;
  ticketCost: string;
  capacity: number;
  seats: number;
  startsAt: number;
  endsAt: number;
  timestamp: number;
  deleted: boolean;
  paidOut: boolean;
  refunded: boolean;
  minted: boolean;
  sourceChainId: number;
}

// 跨链门票数据结构
export interface CrossChainTicket {
  id: number;
  eventId: number;
  owner: string;
  ticketCost: string;
  timestamp: number;
  refunded: boolean;
  minted: boolean;
  sourceChainId: number;
}

// 跨链服务类
export class CrossChainService {
  private configs: Map<number, CrossChainConfig> = new Map();

  constructor() {
    // 初始化网络配置
    CROSS_CHAIN_NETWORKS.forEach(config => {
      this.configs.set(config.chainId, config);
    });
  }

  // 获取网络配置
  getNetworkConfig(chainId: number): CrossChainConfig | undefined {
    return this.configs.get(chainId);
  }

  // 获取所有支持的网络
  getSupportedNetworks(isTestnet?: boolean): CrossChainConfig[] {
    if (isTestnet === undefined) {
      return CROSS_CHAIN_NETWORKS;
    }
    return CROSS_CHAIN_NETWORKS.filter(config => config.isTestnet === isTestnet);
  }

  // 检查网络是否支持
  isNetworkSupported(chainId: number): boolean {
    return this.configs.has(chainId);
  }

  // 获取跨链目标网络列表（排除当前网络）
  getTargetNetworks(currentChainId: number): CrossChainConfig[] {
    return CROSS_CHAIN_NETWORKS.filter(config => config.chainId !== currentChainId);
  }

  // 计算跨链 Gas 费用
  calculateCrossChainGasFee(messageType: CrossChainMessageType, targetChainId: number): string {
    const gasFees: Record<CrossChainMessageType, string> = {
      [CrossChainMessageType.CREATE_EVENT]: "200000",
      [CrossChainMessageType.UPDATE_EVENT]: "100000",
      [CrossChainMessageType.BUY_TICKET]: "150000",
      [CrossChainMessageType.DELETE_EVENT]: "50000",
      [CrossChainMessageType.PAYOUT_EVENT]: "100000"
    };

    return gasFees[messageType] || "100000";
  }

  // 格式化跨链事件数据
  formatCrossChainEvent(event: any): CrossChainEvent {
    return {
      id: Number(event.id),
      metadataURI: event.metadataURI,
      owner: event.owner,
      ticketCost: event.ticketCost.toString(),
      capacity: Number(event.capacity),
      seats: Number(event.seats),
      startsAt: Number(event.startsAt),
      endsAt: Number(event.endsAt),
      timestamp: Number(event.timestamp),
      deleted: event.deleted,
      paidOut: event.paidOut,
      refunded: event.refunded,
      minted: event.minted,
      sourceChainId: Number(event.sourceChainId)
    };
  }

  // 格式化跨链门票数据
  formatCrossChainTicket(ticket: any): CrossChainTicket {
    return {
      id: Number(ticket.id),
      eventId: Number(ticket.eventId),
      owner: ticket.owner,
      ticketCost: ticket.ticketCost.toString(),
      timestamp: Number(ticket.timestamp),
      refunded: ticket.refunded,
      minted: ticket.minted,
      sourceChainId: Number(ticket.sourceChainId)
    };
  }

  // 获取跨链事件
  async getCrossChainEvents(chainId: number, contract: any): Promise<CrossChainEvent[]> {
    try {
      const events = await contract.getCrossChainEvents(chainId);
      return events.map((event: any) => this.formatCrossChainEvent(event));
    } catch (error) {
      console.error(`获取跨链事件失败 (链ID: ${chainId}):`, error);
      return [];
    }
  }

  // 获取跨链单个事件
  async getCrossChainSingleEvent(chainId: number, eventId: number, contract: any): Promise<CrossChainEvent | null> {
    try {
      const event = await contract.getCrossChainSingleEvent(chainId, eventId);
      return this.formatCrossChainEvent(event);
    } catch (error) {
      console.error(`获取跨链单个事件失败 (链ID: ${chainId}, 事件ID: ${eventId}):`, error);
      return null;
    }
  }

  // 获取跨链门票
  async getCrossChainTickets(chainId: number, eventId: number, contract: any): Promise<CrossChainTicket[]> {
    try {
      const tickets = await contract.getCrossChainTickets(chainId, eventId);
      return tickets.map((ticket: any) => this.formatCrossChainTicket(ticket));
    } catch (error) {
      console.error(`获取跨链门票失败 (链ID: ${chainId}, 事件ID: ${eventId}):`, error);
      return [];
    }
  }

  // 创建跨链事件
  async createCrossChainEvent(
    targetChainId: number,
    metadataURI: string,
    capacity: number,
    ticketCost: string,
    startsAt: number,
    endsAt: number,
    contract: any,
    signer: any
  ): Promise<any> {
    try {
      const gasFee = this.calculateCrossChainGasFee(CrossChainMessageType.CREATE_EVENT, targetChainId);
      const tx = await contract.connect(signer).createEventCrossChain(
        targetChainId,
        metadataURI,
        capacity,
        ticketCost,
        startsAt,
        endsAt,
        gasFee,
        { value: ethers.parseEther("0.01") } // 跨链费用
      );
      return tx;
    } catch (error) {
      console.error(`创建跨链事件失败:`, error);
      throw error;
    }
  }

  // 跨链购买门票
  async buyCrossChainTickets(
    targetChainId: number,
    eventId: number,
    numOfTickets: number,
    contract: any,
    signer: any
  ): Promise<any> {
    try {
      const gasFee = this.calculateCrossChainGasFee(CrossChainMessageType.BUY_TICKET, targetChainId);
      const ticketCost = await contract.getSingleEvent(eventId).then((event: any) => event.ticketCost);
      const totalCost = BigInt(ticketCost) * BigInt(numOfTickets) + ethers.parseEther("0.01");
      
      const tx = await contract.connect(signer).buyTicketsCrossChain(
        targetChainId,
        eventId,
        numOfTickets,
        gasFee,
        { value: totalCost }
      );
      return tx;
    } catch (error) {
      console.error(`跨链购买门票失败:`, error);
      throw error;
    }
  }
}

// 导出单例实例
export const crossChainService = new CrossChainService();
