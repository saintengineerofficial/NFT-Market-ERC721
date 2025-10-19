// LayerZero 端点配置
const LAYERZERO_ENDPOINTS = {
  // 主网端点
  ethereum: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
  bsc: "0x3c2269811836af69497E5F486A85D7316753cf62",
  polygon: "0x3c2269811836af69497E5F486A85D7316753cf62",
  avalanche: "0x3c2269811836af69497E5F486A85D7316753cf62",
  arbitrum: "0x3c2269811836af69497E5F486A85D7316753cf62",
  optimism: "0x3c2269811836af69497E5F486A85D7316753cf62",
  
  // 测试网端点
  goerli: "0xbfD2135BFfbb0B6668E3531c5Ae19138b0dA7361",
  bscTestnet: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
  mumbai: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8",
  fuji: "0x93f54DcA3C7432D0b8b6Cfa82e5D3c43b2f8b0e1",
  arbitrumGoerli: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
  optimismGoerli: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1"
};

// 链ID映射
const CHAIN_IDS = {
  ethereum: 101,
  bsc: 102,
  polygon: 109,
  avalanche: 106,
  arbitrum: 110,
  optimism: 111,
  goerli: 10121,
  bscTestnet: 10102,
  mumbai: 10109,
  fuji: 10106,
  arbitrumGoerli: 10110,
  optimismGoerli: 10111
};

// 跨链路由配置
const CROSS_CHAIN_ROUTES = {
  // 主网路由
  mainnet: {
    ethereum: { endpoint: LAYERZERO_ENDPOINTS.ethereum, chainId: CHAIN_IDS.ethereum },
    bsc: { endpoint: LAYERZERO_ENDPOINTS.bsc, chainId: CHAIN_IDS.bsc },
    polygon: { endpoint: LAYERZERO_ENDPOINTS.polygon, chainId: CHAIN_IDS.polygon },
    avalanche: { endpoint: LAYERZERO_ENDPOINTS.avalanche, chainId: CHAIN_IDS.avalanche },
    arbitrum: { endpoint: LAYERZERO_ENDPOINTS.arbitrum, chainId: CHAIN_IDS.arbitrum },
    optimism: { endpoint: LAYERZERO_ENDPOINTS.optimism, chainId: CHAIN_IDS.optimism }
  },
  
  // 测试网路由
  testnet: {
    goerli: { endpoint: LAYERZERO_ENDPOINTS.goerli, chainId: CHAIN_IDS.goerli },
    bscTestnet: { endpoint: LAYERZERO_ENDPOINTS.bscTestnet, chainId: CHAIN_IDS.bscTestnet },
    mumbai: { endpoint: LAYERZERO_ENDPOINTS.mumbai, chainId: CHAIN_IDS.mumbai },
    fuji: { endpoint: LAYERZERO_ENDPOINTS.fuji, chainId: CHAIN_IDS.fuji },
    arbitrumGoerli: { endpoint: LAYERZERO_ENDPOINTS.arbitrumGoerli, chainId: CHAIN_IDS.arbitrumGoerli },
    optimismGoerli: { endpoint: LAYERZERO_ENDPOINTS.optimismGoerli, chainId: CHAIN_IDS.optimismGoerli }
  }
};

// Gas 费用配置（以 wei 为单位）
const GAS_FEES = {
  createEvent: "200000", // 创建活动的 gas 费用
  buyTicket: "150000",   // 购买门票的 gas 费用
  updateEvent: "100000", // 更新活动的 gas 费用
  deleteEvent: "50000",  // 删除活动的 gas 费用
  payoutEvent: "100000"  // 支付活动的 gas 费用
};

// 获取当前网络的 LayerZero 端点
function getLzEndpoint(networkName) {
  const network = networkName.toLowerCase();
  
  if (CROSS_CHAIN_ROUTES.mainnet[network]) {
    return CROSS_CHAIN_ROUTES.mainnet[network].endpoint;
  } else if (CROSS_CHAIN_ROUTES.testnet[network]) {
    return CROSS_CHAIN_ROUTES.testnet[network].endpoint;
  } else {
    throw new Error(`Unsupported network: ${networkName}`);
  }
}

// 获取链ID
function getChainId(networkName) {
  const network = networkName.toLowerCase();
  
  if (CROSS_CHAIN_ROUTES.mainnet[network]) {
    return CROSS_CHAIN_ROUTES.mainnet[network].chainId;
  } else if (CROSS_CHAIN_ROUTES.testnet[network]) {
    return CROSS_CHAIN_ROUTES.testnet[network].chainId;
  } else {
    throw new Error(`Unsupported network: ${networkName}`);
  }
}

// 获取支持的链列表
function getSupportedChains(isTestnet = false) {
  return isTestnet ? Object.keys(CROSS_CHAIN_ROUTES.testnet) : Object.keys(CROSS_CHAIN_ROUTES.mainnet);
}

// 验证链是否支持
function isChainSupported(networkName, isTestnet = false) {
  const chains = getSupportedChains(isTestnet);
  return chains.includes(networkName.toLowerCase());
}

module.exports = {
  LAYERZERO_ENDPOINTS,
  CHAIN_IDS,
  CROSS_CHAIN_ROUTES,
  GAS_FEES,
  getLzEndpoint,
  getChainId,
  getSupportedChains,
  isChainSupported
};
