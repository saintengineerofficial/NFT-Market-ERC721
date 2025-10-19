import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EventModule = buildModule("EventSystem", (m) => {
  // 1. 先部署 TicketNFT 合约
  const ticketNFT = m.contract("TicketNFT", []);
  
  // 2. 部署 EventManager 合约，传入服务费百分比和 TicketNFT 地址
  const eventManager = m.contract("EventManager", [5, ticketNFT]);

  // 3. 设置 TicketNFT 的 EventManager 地址
  m.call(ticketNFT, "setEventManager", [eventManager]);

  return { ticketNFT, eventManager };
});

export default EventModule;
