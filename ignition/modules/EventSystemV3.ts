import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EventSystemV3Module = buildModule("EventSystemV3", (m) => {
  // 1. 先部署 TicketERC1155 合约
  const ticketERC1155 = m.contract("TicketERC1155", []);
  
  // 2. 部署 EventManagerV3 合约，传入服务费百分比和 TicketERC1155 地址
  const eventManagerV3 = m.contract("EventManagerV3", [5, ticketERC1155]);

  // 3. 设置 TicketERC1155 的 EventManager 地址
  m.call(ticketERC1155, "setEventManager", [eventManagerV3]);

  return { ticketERC1155, eventManagerV3 };
});

export default EventSystemV3Module;
