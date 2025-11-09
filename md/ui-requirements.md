# NFT 活动门票系统 - UI需求原型分析

## 一、系统概述

基于 ERC1155 标准的多类型门票 NFT 活动管理系统，支持活动创建、门票购买、检票、退款、提现等完整业务流程。

### 核心特性
- **多类型门票支持**：每个活动可配置多种门票类型（普通票、VIP票、早鸟票）
- **NFT 门票**：购买后立即铸造 ERC1155 NFT 门票
- **转让限制**：活动结束前门票不可转让
- **检票系统**：支持检票员权限管理和检票记录
- **退款机制**：支持个人退款和活动取消退款
- **收益分配**：活动结束后可提现，平台收取服务费

---

## 二、用户角色

### 1. 普通用户（Buyer）
- 浏览活动列表
- 购买门票
- 查看我的门票
- 申请个人退款
- 转让门票（活动结束后）

### 2. 活动主办方（Event Owner）
- 创建活动
- 编辑活动信息
- 管理门票类型
- 管理检票员
- 查看活动数据
- 提现收益
- 删除活动（触发退款）

### 3. 检票员（Checker）
- 检票功能
- 查看检票记录

### 4. 平台管理员（Platform Admin）
- 所有主办方权限
- 平台收益管理

---

## 三、核心功能模块

### 3.1 活动管理模块

#### 3.1.1 创建活动
**合约函数**: `createEventWithTicketTypes`

**UI 需求**:
- 表单字段：
  - 活动元数据 URI（metadataURI）
  - 活动开始时间（startsAt）
  - 活动结束时间（endsAt）
  - 门票类型配置（可添加多个）：
    - 门票类型（GENERAL/VIP/EARLY_BIRD）
    - 门票名称
    - 价格（ETH）
    - 容量（总数量）
    - 元数据 URI

**业务规则**:
- 结束时间必须大于开始时间
- 至少配置一种门票类型
- 价格和容量必须大于 0
- 元数据 URI 不能为空

**交互流程**:
1. 用户填写活动基本信息
2. 添加门票类型（可添加多个）
3. 提交表单，调用合约创建活动
4. 显示交易状态和结果

---

#### 3.1.2 活动列表页
**合约函数**: `getEvents()`, `getSingleEvent()`, `getActiveTicketTypes()`, `getTicketTypeInfo()`

**UI 需求**:
- 展示所有未删除的活动
- 每个活动卡片显示：
  - 活动 ID
  - 活动封面图（从 metadataURI 获取）
  - 活动名称
  - 开始/结束时间
  - 状态标签（未开始/进行中/已结束/已删除）
  - 门票类型概览（价格范围、剩余数量）
  - 操作按钮（查看详情/购买门票）

**筛选功能**:
- 按状态筛选（未开始/进行中/已结束）
- 按时间排序

---

#### 3.1.3 活动详情页
**合约函数**: `getSingleEvent()`, `getActiveTicketTypes()`, `getTicketTypeInfo()`

**UI 需求**:
- 活动基本信息展示区：
  - 活动封面图
  - 活动名称、描述
  - 开始/结束时间
  - 活动状态
  - 主办方地址

- 门票类型列表：
  - 每种门票类型卡片显示：
    - 门票类型名称（GENERAL/VIP/EARLY_BIRD）
    - 价格（ETH）
    - 已售/总容量
    - 剩余数量
    - 是否激活
    - 购买按钮（未开始且未售罄时显示）

- 操作区域（仅主办方可见）：
  - 编辑活动按钮
  - 管理门票类型按钮
  - 管理检票员按钮
  - 提现按钮（活动结束后且未提现）
  - 删除活动按钮（未提现时）

---

#### 3.1.4 编辑活动
**合约函数**: `updateEvent()`

**UI 需求**:
- 可编辑字段：
  - 活动元数据 URI
  - 开始时间
  - 结束时间
- 只读字段：
  - 活动 ID
  - 主办方地址

**权限**: 仅活动主办方可编辑

---

#### 3.1.5 管理门票类型
**合约函数**: `updateTicketType()`

**UI 需求**:
- 显示所有门票类型列表
- 每个门票类型可编辑：
  - 名称
  - 价格
  - 容量（不能小于已售数量）
  - 元数据 URI
  - 激活状态（开启/关闭）

**业务规则**:
- 新容量不能小于已售数量
- 价格必须大于 0

---

#### 3.1.6 我的活动
**合约函数**: `getMyEvents()`

**UI 需求**:
- 显示当前用户创建的所有活动
- 活动卡片显示：
  - 活动基本信息
  - 活动状态
  - 总收益（已售门票总价值）
  - 是否已提现
  - 快速操作按钮

---

### 3.2 门票购买模块

#### 3.2.1 购买门票
**合约函数**: `buyTicketsByType()`

**UI 需求**:
- 购买表单：
  - 选择门票类型（下拉选择）
  - 输入购买数量
  - 显示单价和总价
  - 显示剩余数量
  - 确认购买按钮

**业务规则**:
- 活动开始前才能购买
- 门票类型必须激活
- 支付金额必须 >= 单价 × 数量
- 购买数量不能超过剩余容量

**交互流程**:
1. 用户选择门票类型和数量
2. 显示总价和确认信息
3. 用户确认并支付 ETH
4. 调用合约购买函数
5. 显示交易状态
6. 成功后显示 NFT 门票信息

---

#### 3.2.2 我的门票
**合约函数**: `getUserTicketTypes()`, `getUserTicketBalance()`, `getUserPurchaseRecords()`

**UI 需求**:
- 门票列表展示：
  - 按活动分组显示
  - 每个活动下显示：
    - 活动信息
    - 持有的门票类型和数量
    - 每张门票显示：
      - NFT 图片（从 metadataURI 获取）
      - 门票类型
      - 数量
      - 购买时间
      - 是否可退款
      - 是否可转让

- 操作功能：
  - 查看门票详情
  - 申请退款（活动开始前 3 天）
  - 转让门票（活动结束后）

---

#### 3.2.3 门票详情
**UI 需求**:
- NFT 门票展示：
  - 门票图片
  - 门票元数据信息
  - 所属活动信息
  - 门票类型
  - 数量
  - Token ID
  - 购买记录

---

### 3.3 退款模块

#### 3.3.1 个人退款
**合约函数**: `personalRefund()`

**UI 需求**:
- 退款表单：
  - 选择活动
  - 选择门票类型
  - 输入退款数量（0 表示全部退款）
  - 显示退款金额
  - 显示退款截止时间（活动开始前 3 天）
  - 确认退款按钮

**业务规则**:
- 必须在活动开始前 3 天申请退款
- 退款数量不能超过持有数量
- 退款后 NFT 门票会被销毁

**交互流程**:
1. 用户选择要退款的门票
2. 输入退款数量
3. 显示退款金额和截止时间
4. 确认退款
5. 调用合约退款函数
6. 显示交易状态

---

#### 3.3.2 活动退款（删除活动）
**合约函数**: `deleteEvent()`, `refundTickets()`

**UI 需求**:
- 仅活动主办方可见
- 删除活动确认对话框：
  - 警告信息
  - 说明删除后将自动退款给所有购买者
  - 已检票的门票不能退款
  - 确认删除按钮

**业务规则**:
- 活动未提现才能删除
- 删除后自动退款给所有购买者（已检票的除外）
- 活动标记为已删除

---

### 3.4 检票模块

#### 3.4.1 管理检票员
**合约函数**: `addChecker()`, `removeChecker()`

**UI 需求**:
- 检票员列表：
  - 显示所有检票员地址
  - 添加时间
  - 操作按钮（移除）

- 添加检票员表单：
  - 输入检票员地址
  - 确认添加按钮

**权限**: 仅活动主办方和平台管理员

---

#### 3.4.2 检票功能
**合约函数**: `checkInWithMark()`, `isCheckedIn()`, `getUserTicketBalance()`

**UI 需求**:
- 检票表单：
  - 输入参与者地址
  - 选择门票类型
  - 显示参与者持有的门票数量
  - 显示是否已检票
  - 确认检票按钮

**业务规则**:
- 只有检票员可以检票
- 参与者必须持有对应类型的门票
- 每个地址每种门票类型只能检票一次
- 检票后门票标记为已使用，但 NFT 保留

**交互流程**:
1. 检票员输入参与者地址
2. 系统查询参与者持有的门票
3. 选择要检票的门票类型
4. 确认检票
5. 调用合约检票函数
6. 显示检票结果

---

#### 3.4.3 检票记录
**合约函数**: `getCheckInRecord()`, `isCheckedIn()`

**UI 需求**:
- 检票记录列表：
  - 参与者地址
  - 门票类型
  - 检票时间
  - 检票员地址
  - 是否已检票状态

**权限**: 检票员和活动主办方可查看

---

### 3.5 收益管理模块

#### 3.5.1 活动提现
**合约函数**: `payOut()`

**UI 需求**:
- 提现信息展示：
  - 活动总收益
  - 平台服务费（百分比）
  - 实际可提现金额
  - 是否已提现状态

- 提现操作：
  - 提现按钮（活动结束后且未提现时显示）
  - 确认提现对话框

**业务规则**:
- 活动结束后才能提现
- 只能提现一次
- 收益自动分配给主办方和平台

**权限**: 仅活动主办方和平台管理员

---

### 3.6 查询功能模块

#### 3.6.1 购买记录查询
**合约函数**: `getUserPurchaseRecords()`

**UI 需求**:
- 显示用户在某个活动的所有购买记录：
  - 购买时间
  - 门票类型
  - 购买数量
  - 总花费
  - 交易哈希

---

#### 3.6.2 门票余额查询
**合约函数**: `getUserTicketBalance()`, `getUserTicketTypes()`

**UI 需求**:
- 查询用户在某个活动持有的门票：
  - 门票类型列表
  - 每种类型的数量
  - 总价值

---

## 四、页面结构

### 4.1 页面路由设计

```
/                          # 首页 - 活动列表
/events/create             # 创建活动
/events/[id]               # 活动详情页
/events/[id]/edit         # 编辑活动
/events/[id]/tickets      # 管理门票类型
/events/[id]/checkers     # 管理检票员
/events/[id]/check-in     # 检票页面
/events/[id]/payout       # 提现页面
/my/events                 # 我的活动
/my/tickets                # 我的门票
/my/tickets/[tokenId]      # 门票详情
/refund                    # 退款页面
```

### 4.2 组件结构

```
components/
  ├── events/
  │   ├── EventCard.tsx           # 活动卡片
  │   ├── EventList.tsx           # 活动列表
  │   ├── EventDetail.tsx         # 活动详情
  │   ├── CreateEventForm.tsx     # 创建活动表单
  │   ├── EditEventForm.tsx       # 编辑活动表单
  │   ├── TicketTypeCard.tsx      # 门票类型卡片
  │   ├── TicketTypeManager.tsx   # 门票类型管理
  │   └── CheckerManager.tsx      # 检票员管理
  ├── tickets/
  │   ├── TicketCard.tsx          # 门票卡片
  │   ├── TicketList.tsx           # 门票列表
  │   ├── BuyTicketForm.tsx       # 购买门票表单
  │   ├── TicketDetail.tsx        # 门票详情
  │   └── RefundForm.tsx          # 退款表单
  ├── check-in/
  │   ├── CheckInForm.tsx         # 检票表单
  │   └── CheckInRecord.tsx       # 检票记录
  ├── payout/
  │   └── PayoutCard.tsx          # 提现卡片
  └── shared/
      ├── ConnectButton.tsx       # 连接钱包按钮
      ├── StatusBadge.tsx         # 状态标签
      └── Countdown.tsx           # 倒计时组件
```

---

## 五、数据结构

### 5.1 活动数据结构

```typescript
interface Event {
  id: number;
  metadataURI: string;
  owner: string;
  startsAt: number;
  endsAt: number;
  timestamp: number;
  deleted: boolean;
  paidOut: boolean;
  refunded: boolean;
  minted: boolean;
  ticketTypes: TicketTypeInfo[];
}

interface TicketTypeInfo {
  ticketType: TicketType; // 0: GENERAL, 1: VIP, 2: EARLY_BIRD
  name: string;
  price: string; // Wei 单位，需要转换为 ETH
  capacity: number;
  sold: number;
  metadataURI: string;
  active: boolean;
}

enum TicketType {
  GENERAL = 0,
  VIP = 1,
  EARLY_BIRD = 2
}
```

### 5.2 购买记录数据结构

```typescript
interface TicketPurchaseRecord {
  buyer: string;
  eventId: number;
  ticketType: TicketType;
  count: number;
  totalCost: string; // Wei 单位
  timestamp: number;
}
```

### 5.3 检票记录数据结构

```typescript
interface CheckInRecord {
  attendee: string;
  ticketType: TicketType;
  timestamp: number;
  checker: string;
}
```

### 5.4 NFT 门票数据结构

```typescript
interface TicketNFT {
  tokenId: number; // eventId * 1000 + ticketType
  eventId: number;
  ticketType: TicketType;
  balance: number; // 持有数量
  metadataURI: string;
  canTransfer: boolean; // 是否可转让
}
```

---

## 六、业务规则总结

### 6.1 时间规则
- **购买限制**: 活动开始前才能购买门票
- **退款期限**: 活动开始前 3 天才能申请个人退款
- **转让限制**: 活动结束后才能转让门票
- **提现条件**: 活动结束后才能提现

### 6.2 权限规则
- **活动编辑**: 仅活动主办方
- **检票**: 仅检票员
- **提现**: 活动主办方或平台管理员
- **删除活动**: 活动主办方或平台管理员

### 6.3 状态规则
- **活动状态**:
  - 未开始: `block.timestamp < startsAt`
  - 进行中: `startsAt <= block.timestamp <= endsAt`
  - 已结束: `block.timestamp > endsAt`
  - 已删除: `deleted === true`

- **门票状态**:
  - 可购买: 活动未开始 && 门票激活 && 未售罄
  - 可退款: 活动开始前 3 天 && 未检票
  - 可转让: 活动已结束

### 6.4 数量规则
- 购买数量不能超过剩余容量
- 退款数量不能超过持有数量
- 更新容量时，新容量不能小于已售数量

---

## 七、UI/UX 设计建议

### 7.1 交互设计
- **钱包连接**: 所有需要链上操作的功能都需要先连接钱包
- **交易状态**: 显示交易 pending、success、failed 状态
- **加载状态**: 所有异步操作显示加载动画
- **错误提示**: 清晰的错误信息提示（合约 revert 原因）
- **确认对话框**: 重要操作（购买、退款、删除）需要二次确认

### 7.2 数据展示
- **ETH 单位转换**: 所有价格显示需要从 Wei 转换为 ETH
- **时间格式化**: 时间戳转换为可读格式
- **状态标签**: 使用不同颜色标签区分状态
- **进度条**: 门票销售进度可视化

### 7.3 响应式设计
- 支持移动端和桌面端
- 卡片式布局适配不同屏幕尺寸

### 7.4 性能优化
- 活动列表分页加载
- 使用 React Query 或 SWR 缓存数据
- 批量查询优化（如同时查询多个活动的门票类型）

---

## 八、技术实现要点

### 8.1 合约交互
- 使用 wagmi 或 ethers.js 与合约交互
- 处理交易确认和错误
- 监听合约事件更新 UI

### 8.2 元数据获取
- 从 metadataURI 获取活动/门票的 JSON 元数据
- 处理 IPFS 或其他存储方案的 URI
- 缓存元数据避免重复请求

### 8.3 状态管理
- 使用 Zustand 或 Redux 管理全局状态
- 缓存合约查询结果
- 实时更新交易状态

### 8.4 错误处理
- 捕获并解析合约 revert 错误
- 网络错误处理
- 用户友好的错误提示

---

## 九、开发优先级建议

### Phase 1: 核心功能
1. 活动列表和详情页
2. 创建活动
3. 购买门票
4. 我的门票

### Phase 2: 管理功能
5. 编辑活动
6. 管理门票类型
7. 我的活动
8. 提现功能

### Phase 3: 高级功能
9. 个人退款
10. 检票系统
11. 转让功能
12. 数据统计

---

## 十、注意事项

1. **Gas 费用**: 提醒用户注意 Gas 费用，特别是批量操作
2. **时间同步**: 确保前端时间与链上时间同步
3. **网络切换**: 处理用户切换网络的情况
4. **元数据格式**: 定义标准的元数据 JSON 格式
5. **测试**: 在测试网充分测试后再部署主网

---

## 附录：合约函数映射表

| UI 功能 | 合约函数 | 参数 |
|---------|---------|------|
| 创建活动 | `createEventWithTicketTypes` | metadataURI, startsAt, endsAt, ticketTypeInfos[] |
| 编辑活动 | `updateEvent` | eventId, metadataURI, startsAt, endsAt |
| 更新门票类型 | `updateTicketType` | eventId, ticketType, name, price, capacity, metadataURI, active |
| 购买门票 | `buyTicketsByType` | eventId, ticketType, count (payable) |
| 个人退款 | `personalRefund` | eventId, ticketType, count |
| 删除活动 | `deleteEvent` | eventId |
| 添加检票员 | `addChecker` | eventId, checker |
| 移除检票员 | `removeChecker` | eventId, checker |
| 检票 | `checkInWithMark` | eventId, attendee, ticketType |
| 提现 | `payOut` | eventId |
| 查询活动 | `getSingleEvent` | eventId |
| 查询活动列表 | `getEvents` | - |
| 查询我的活动 | `getMyEvents` | - |
| 查询门票类型 | `getTicketTypeInfo` | eventId, ticketType |
| 查询活跃门票类型 | `getActiveTicketTypes` | eventId |
| 查询用户门票 | `getUserTicketTypes` | eventId, user |
| 查询购买记录 | `getUserPurchaseRecords` | eventId, user |
| 查询检票记录 | `getCheckInRecord` | eventId, attendee |
| 查询是否已检票 | `isCheckedIn` | eventId, attendee |
| 查询是否可转让 | `canTransferTicket` | eventId |

