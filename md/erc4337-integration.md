# ERC-4337 账户抽象集成方案

## 概述

ERC-4337 允许用户使用智能合约钱包，支持：
- **社交登录**：使用邮箱、Google等登录
- **Gas代付**：Paymaster 代付交易费用
- **批量交易**：一次签名执行多笔交易
- **密钥恢复**：丢失私钥可恢复账户

## 核心组件

### 1. EntryPoint 合约
- ERC-4337 的核心入口点
- 验证和执行 UserOperations
- 已有官方实现，可直接部署

### 2. Smart Contract Wallet（智能合约钱包）
- 用户的实际账户地址
- 执行用户的意图（签名验证、交易执行等）
- 可以使用 SimpleAccount 或自定义实现

### 3. Bundler（打包器）
- 将 UserOperations 打包成交易
- 发送到 EntryPoint
- 可以使用 Alchemy、Stackup、Pimlico 等服务

### 4. Paymaster（可选）
- 代付用户交易 gas 费
- 可以实现 gas 代付策略

## 工作流程

```
用户操作
  ↓
前端构建 UserOperation
  ↓
发送到 Bundler
  ↓
Bundler 打包成交易 → EntryPoint
  ↓
EntryPoint 验证签名
  ↓
调用 Smart Contract Wallet
  ↓
Wallet 执行用户意图（调用 EventManager 等）
  ↓
交易完成
```

## 实现步骤

### 第一步：安装依赖

```bash
npm install @account-abstraction/sdk
npm install @account-abstraction/contracts
# 或者使用 aa-sdk (permissionless)
npm install @permissionless/viem
```

### 第二步：部署 EntryPoint 合约

EntryPoint 地址在主网已部署：`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`

### 第三步：创建智能合约钱包工厂

创建 `contracts/SimpleAccountFactory.sol` 或使用现有的工厂合约

### 第四步：前端集成

使用 `@account-abstraction/sdk` 或 `@permissionless/viem` 构建 UserOperation

### 第五步：配置 Bundler

使用 Alchemy 或其他 Bundler 服务：
- Alchemy: `https://api.stackup.sh/v1/rpc/[API_KEY]`
- Stackup: `https://api.stackup.sh/v1/rpc/[API_KEY]`
- Pimlico: `https://api.pimlico.io/v2/[CHAIN]/rpc?apikey=[API_KEY]`

## 技术细节

### UserOperation 结构

```typescript
{
  sender: string,           // 智能合约钱包地址
  nonce: bigint,            // 钱包nonce
  initCode: string,         // 如果是新钱包，创建代码
  callData: string,         // 要执行的调用数据
  callGasLimit: bigint,     // 调用gas限制
  verificationGasLimit: bigint,
  preVerificationGas: bigint,
  maxFeePerGas: bigint,
  maxPriorityFeePerGas: bigint,
  paymasterAndData: string, // Paymaster数据（如果有）
  signature: string         // 用户签名
}
```

## 与现有系统集成

### 方案 A：保留现有钱包，添加智能合约钱包选项
- 用户可以选择传统钱包或智能合约钱包
- 两套交易逻辑并存

### 方案 B：完全迁移到账户抽象
- 所有交易都通过 UserOperation
- 需要更多重构工作

## 推荐方案

建议采用**方案 A（渐进式）**：
1. 添加智能合约钱包作为可选登录方式
2. 使用 Paymaster 实现 gas 代付（提升用户体验）
3. 逐步引导用户使用智能合约钱包

## 参考资料

- [ERC-4337 官方文档](https://eips.ethereum.org/EIPS/eip-4337)
- [Alchemy Account Abstraction 指南](https://www.alchemy.com/blog/account-abstraction)
- [Stackup 文档](https://docs.stackup.sh/)
- [Pimlico 文档](https://docs.pimlico.io/)

