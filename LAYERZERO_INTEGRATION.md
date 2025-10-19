# LayerZero 跨链集成指南

## 概述

本项目已成功集成 LayerZero 跨链协议，实现了 NFT 市场和事件票务系统的跨链互操作性。用户可以在任何支持的区块链上创建、购买和交易 NFT 门票。

## 功能特性

### 🌐 跨链功能
- **跨链事件创建**: 在任意支持的链上创建活动
- **跨链门票购买**: 在任何链上购买其他链的活动门票
- **跨链状态同步**: 实时同步跨链事件状态
- **跨链 NFT 铸造**: 活动结束后自动铸造跨链 NFT 门票

### 🔗 支持的区块链
- **测试网**: Goerli, BSC Testnet, Mumbai, Fuji, Arbitrum Goerli, Optimism Goerli
- **主网**: Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 并填入您的配置：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# Infura API Key
INFURA_API_KEY=your_infura_api_key_here

# 私钥配置
PRIVATE_KEY_1=your_private_key_1_here
PRIVATE_KEY_2=your_private_key_2_here

# 服务费配置
SERVICE_FEE_PERCENTAGE=5
```

### 3. 编译合约

```bash
npm run compile
```

### 4. 部署跨链合约

#### 部署到测试网

```bash
# 部署到 Goerli
npm run deploy:goerli

# 部署到 Mumbai
npm run deploy:mumbai

# 部署到 BSC Testnet
npm run deploy:bsc-testnet
```

#### 部署到主网

```bash
# 部署到 Ethereum
npx hardhat run scripts/deploy-crosschain.js --network ethereum

# 部署到 Polygon
npx hardhat run scripts/deploy-crosschain.js --network polygon

# 部署到 BSC
npx hardhat run scripts/deploy-crosschain.js --network bsc
```

### 5. 配置跨链连接

部署完成后，需要配置各链之间的可信远程地址：

```bash
# 配置 Goerli
npm run configure:goerli

# 配置 Mumbai
npm run configure:mumbai
```

### 6. 测试跨链功能

```bash
# 测试 Goerli
npm run test:goerli

# 测试 Mumbai
npm run test:mumbai
```

## 合约架构

### 核心合约

#### `CrossChainMK.sol`
主要的跨链合约，继承自 LayerZero 的 `NonblockingLzApp`：

```solidity
contract CrossChainMK is Ownable, ReentrancyGuard, ERC721, NonblockingLzApp {
    // 跨链消息类型
    enum MessageType {
        CREATE_EVENT,
        UPDATE_EVENT,
        BUY_TICKET,
        DELETE_EVENT,
        PAYOUT_EVENT
    }
    
    // 跨链消息处理
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal override {
        // 处理跨链消息
    }
}
```

### 跨链消息流程

1. **创建事件**: 用户调用 `createEventCrossChain()` 在目标链创建事件
2. **消息传递**: LayerZero 将消息传递到目标链
3. **状态同步**: 目标链接收消息并同步事件状态
4. **门票购买**: 用户可以在任何链上购买其他链的事件门票
5. **NFT 铸造**: 活动结束后自动铸造跨链 NFT 门票

## 前端集成

### 跨链服务

```typescript
import { crossChainService } from '../services/crosschain';

// 获取支持的网络
const networks = crossChainService.getSupportedNetworks();

// 创建跨链事件
const tx = await crossChainService.createCrossChainEvent(
  targetChainId,
  metadataURI,
  capacity,
  ticketCost,
  startsAt,
  endsAt,
  contract,
  signer
);
```

### 跨链组件

#### `CrossChainEventCreator`
用于创建跨链事件的组件：

```tsx
<CrossChainEventCreator 
  contract={contract} 
  onEventCreated={(eventId, chainId) => {
    console.log(`事件 ${eventId} 在链 ${chainId} 上创建成功`);
  }} 
/>
```

#### `CrossChainEventViewer`
用于查看跨链事件的组件：

```tsx
<CrossChainEventViewer contract={contract} />
```

## 部署脚本说明

### `deploy-crosschain.js`
- 部署跨链合约到指定网络
- 自动配置 LayerZero 端点
- 保存部署信息到 `deployments/` 目录

### `configure-crosschain.js`
- 配置跨链可信远程地址
- 设置跨链路由
- 验证跨链连接

### `test-crosschain.js`
- 测试本地功能
- 测试跨链功能
- 验证跨链消息传递

## 配置说明

### LayerZero 端点配置

```javascript
const LAYERZERO_ENDPOINTS = {
  // 主网端点
  ethereum: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
  bsc: "0x3c2269811836af69497E5F486A85D7316753cf62",
  polygon: "0x3c2269811836af69497E5F486A85D7316753cf62",
  
  // 测试网端点
  goerli: "0xbfD2135BFfbb0B6668E3531c5Ae19138b0dA7361",
  mumbai: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8"
};
```

### Gas 费用配置

```javascript
const GAS_FEES = {
  createEvent: "200000",    // 创建活动
  buyTicket: "150000",      // 购买门票
  updateEvent: "100000",    // 更新活动
  deleteEvent: "50000",     // 删除活动
  payoutEvent: "100000"     // 支付活动
};
```

## 使用示例

### 1. 创建跨链事件

```typescript
// 在 Goerli 上创建事件，同步到 Mumbai
const tx = await crossChainMK.createEventCrossChain(
  10109, // Mumbai 链ID
  "ipfs://QmEventMetadata",
  100, // 容量
  ethers.parseEther("0.1"), // 门票价格
  Math.floor(Date.now() / 1000) + 3600, // 开始时间
  Math.floor(Date.now() / 1000) + 7200, // 结束时间
  "200000", // Gas 费用
  { value: ethers.parseEther("0.01") } // 跨链费用
);
```

### 2. 跨链购买门票

```typescript
// 在 Mumbai 上购买 Goerli 的事件门票
const tx = await crossChainMK.buyTicketsCrossChain(
  10121, // Goerli 链ID
  1, // 事件ID
  2, // 门票数量
  "150000", // Gas 费用
  { value: ethers.parseEther("0.21") } // 门票费用 + 跨链费用
);
```

### 3. 查询跨链事件

```typescript
// 查询 Mumbai 链上的事件
const events = await crossChainMK.getCrossChainEvents(10109);
console.log(`Mumbai 链上有 ${events.length} 个事件`);
```

## 故障排除

### 常见问题

1. **跨链消息失败**
   - 检查目标链的合约地址是否正确配置
   - 确认 LayerZero 端点配置正确
   - 验证 Gas 费用是否足够

2. **部署失败**
   - 检查网络连接和 RPC 端点
   - 确认私钥和账户余额
   - 验证 LayerZero 端点地址

3. **跨链功能不工作**
   - 确认可信远程地址已正确设置
   - 检查跨链消息是否正确发送
   - 验证目标链的合约部署

### 调试技巧

1. **查看部署日志**
   ```bash
   npm run deploy:goerli 2>&1 | tee deployment.log
   ```

2. **检查跨链状态**
   ```bash
   npm run test:goerli
   ```

3. **验证合约配置**
   ```bash
   npm run configure:goerli
   ```

## 安全注意事项

1. **私钥安全**: 永远不要在代码中硬编码私钥
2. **Gas 费用**: 合理设置跨链 Gas 费用，避免过高或过低
3. **合约验证**: 部署后及时验证合约代码
4. **权限管理**: 合理设置合约所有者权限
5. **测试充分**: 在主网部署前充分测试所有功能

## 更新日志

### v1.0.0
- 初始 LayerZero 集成
- 支持跨链事件创建和门票购买
- 实现跨链状态同步
- 添加跨链 NFT 铸造功能

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [项目 Issues 页面]
- Email: [您的邮箱]
- Discord: [您的 Discord 服务器]

---

**注意**: 这是一个跨链集成示例，实际使用时请根据您的具体需求进行调整和优化。
