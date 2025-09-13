# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
主要功能模块：
活动展示 - 首页展示最近活动，支持分页加载
活动创建 - 用户可以创建新活动，包含完整的表单验证
活动详情 - 展示活动详细信息，支持购买门票
活动管理 - 活动所有者可以编辑、删除活动，查看销售记录
门票购买 - 用户可以使用ETH购买活动门票
个人中心 - 查看用户创建的所有活动
展示的主要字段：
活动信息：标题、描述、图片、价格、容量、时间
状态信息：活动状态（开放/已铸造）、剩余座位、剩余时间
购买记录：购买者头像、地址、购买时间、价格