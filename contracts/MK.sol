//SPDX-License-Identifier:MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MK is Ownable, ReentrancyGuard, ERC721 {
  using Counters for Counters.Counter;
  Counters.Counter private _totalEvents;
  Counters.Counter private _totalTokes;

  // 活动结构体
  struct EventStruct {
    uint256 id;
    string title;
    string imageUrl;
    string description;
    address owner;
    uint256 sales; // 销售量
    uint256 ticketCost;
    uint256 capacity; // 容量
    uint256 seats; // 座位数
    uint256 startsAt; // 开始时间
    uint256 endsAt; // 结束时间
    uint256 timestamp; // 创建时间
    bool deleted; // 是否删除
    bool paidOut; // 是否将合约中的金额支付给合约所有者（类似从合约提现走），功能上没有具体使用，记录
    bool refunded; // 是否退款，活动取消退款所有用户金额
    bool minted; // 是否铸造
  }

  // 活动售出票结构体
  struct TicketStruct {
    uint256 id;
    uint256 eventId;
    address owner;
    uint256 ticketCost;
    uint256 timestamp;
    bool refunded; // 是否退款
    bool minted; // 是否铸造
  }

  uint256 public balance; // 合约内存放的金额
  uint256 private servicePct; // 服务费

  mapping(uint256 => EventStruct) events;
  mapping(uint256 => TicketStruct[]) tickets; // 活动=>数组(被购买的票)，数组中每个元素是一个票
  mapping(uint256 => bool) eventExists; // 活动是否存在

  // 初始化
  constructor(uint256 _pct) ERC721("Saint MK", "SMK") {
    servicePct = _pct;
  }

  // 活动主办方，创建活动
  function createEvent(
    string memory title,
    string memory description,
    string memory imageUrl,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt
  ) public {
    require(bytes(title).length > 0, "Title cannot be empty");
    require(bytes(description).length > 0, "Description cannot be empty");
    require(bytes(imageUrl).length > 0, "ImageUrl cannot be empty");
    require(capacity > 0, "Capacity must be greater than zero");
    require(ticketCost > 0 ether, "TicketCost must be greater than zero");
    require(startsAt > 0, "StartsAt must be greater than zero");
    require(endsAt > startsAt, "EndsAt must be greater than StartsAt");

    _totalEvents.increment();
    EventStruct memory eventMK;
    eventMK.id = _totalEvents.current();
    eventMK.title = title;
    eventMK.description = description;
    eventMK.imageUrl = imageUrl;
    eventMK.capacity = capacity;
    eventMK.ticketCost = ticketCost;
    eventMK.startsAt = startsAt;
    eventMK.endsAt = endsAt;
    eventMK.owner = msg.sender;
    eventMK.timestamp = currentTime();

    events[eventMK.id] = eventMK;
    eventExists[eventMK.id] = true;
  }

  // 活动主办方，更新活动
  function updateEvent(
    uint256 eventId,
    string memory title,
    string memory description,
    string memory imageUrl,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt
  ) public {
    require(msg.sender == events[eventId].owner, "You are not the owner of this event");
    require(eventExists[eventId], "Event does not exist");
    // require(currentTime() > events[eventId].startsAt, 'Event has started, cannot be updated');

    require(bytes(title).length > 0, "Title cannot be empty");
    require(bytes(description).length > 0, "Description cannot be empty");
    require(bytes(imageUrl).length > 0, "ImageUrl cannot be empty");
    require(capacity > 0, "Capacity must be greater than zero");
    require(ticketCost > 0 ether, "TicketCost must be greater than zero");
    require(startsAt > 0, "StartsAt must be greater than zero");
    require(endsAt > startsAt, "EndsAt must be greater than StartsAt");

    events[eventId].title = title;
    events[eventId].description = description;
    events[eventId].imageUrl = imageUrl;
    events[eventId].capacity = capacity;
    events[eventId].ticketCost = ticketCost;
    events[eventId].startsAt = startsAt;
    events[eventId].endsAt = endsAt;
  }

  // 合约部署者行为/合约部署方，删除活动
  function deleteEvent(uint256 eventId) public {
    // owner是合约部署者
    require(msg.sender == events[eventId].owner || msg.sender == owner(), "You are not the owner of this event");
    require(eventExists[eventId], "Event does not exist");
    require(!events[eventId].deleted, "Event already deleted");
    // 留底记录活动，不能删除
    require(!events[eventId].paidOut, "Event has not been paid out"); //该活动在合约中有金额，不能删除
    require(!events[eventId].refunded, "Event has not been refunded"); //该活动有退款，不能删除
    require(refundTickets(eventId), "Refund tickets failed"); // 退款失败
    events[eventId].deleted = true;
    // eventExists[eventId] = false; // 不用删除，作为记录
  }

  // 用户行为，获取所有未删除的活动
  // returns (EventStruct[] memory Events)是Solidity的语法，表示返回一个EventStruct类型的数组，函数中不用写return
  function getEvents() public view returns (EventStruct[] memory Events) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        available++;
      }
    }

    // 创建有效的活动数组
    Events = new EventStruct[](available);

    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        Events[index++] = events[i];
      }
    }
  }

  // 用户行为，获取我的活动
  function getMyEvents() public view returns (EventStruct[] memory Events) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted && events[i].owner == msg.sender) {
        available++;
      }
    }

    Events = new EventStruct[](available);

    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted && events[i].owner == msg.sender) {
        Events[index++] = events[i];
      }
    }
  }

  // 用户行为，获取单个活动
  function getSingleEvent(uint256 eventId) public view returns (EventStruct memory) {
    require(eventExists[eventId], "Event does not exist");
    return events[eventId];
  }

  // 用户行为，购买票
  function buyTickets(uint256 eventId, uint256 numOfticket) public payable {
    require(eventExists[eventId], "Event not found");
    require(numOfticket > 0, "NumOfticket must be greater than zero");
    require(msg.value >= events[eventId].ticketCost * numOfticket, "Insufficient amount");
    require(events[eventId].seats + numOfticket <= events[eventId].capacity, "Out of seating capacity");

    for (uint256 i = 0; i < numOfticket; i++) {
      TicketStruct memory ticket;
      ticket.id = tickets[eventId].length; // tickets存放着每个活动的票，每个活动有多个票,每次push一个票，length就+1
      ticket.eventId = eventId;
      ticket.owner = msg.sender;
      ticket.ticketCost = events[eventId].ticketCost;
      ticket.timestamp = currentTime();
      tickets[eventId].push(ticket);
    }

    events[eventId].seats += numOfticket;
    balance = balance + msg.value; // 增加合约余额
  }

  // 用户行为，获取单个活动的票，（不需要加入owner判断，去中心化性质，任何人都可以获取）
  function getTickets(uint256 eventId) public view returns (TicketStruct[] memory Tickets) {
    return tickets[eventId];
  }

  // 合约部署方，退款，配合删除活动
  function refundTickets(uint256 eventId) internal returns (bool) {
    for (uint256 i = 0; i < tickets[eventId].length; i++) {
      payto(tickets[eventId][i].owner, tickets[eventId][i].ticketCost);
      tickets[eventId][i].refunded = true;
      balance = balance - tickets[eventId][i].ticketCost;
    }
    events[eventId].refunded = true;

    return true;
  }

  // 活动主办方行为/合约部署方，将合约中的金额提现走并支付服务费给合约部署者
  function payOut(uint256 eventId) public nonReentrant {
    require(eventExists[eventId], "Event not found");
    require(!events[eventId].paidOut, "Event already paid out"); // 活动已经提现过
    require(currentTime() > events[eventId].endsAt, "Event still ongoing");
    require(msg.sender == events[eventId].owner || msg.sender == owner(), "Unauthorized entity");
    require(mintTickets(eventId), "Event failed to mint");
    // 计算总收入
    uint256 revenue = events[eventId].seats * events[eventId].ticketCost;
    // 计算服务费
    uint256 fee = (revenue * servicePct) / 100;

    // 支付活动主办方
    payto(events[eventId].owner, revenue - fee);
    // 支付合约部署者
    payto(owner(), fee);

    events[eventId].paidOut = true;
    balance -= revenue;
  }

  // 根据票铸造nft给用户，当主办方或合约部署着提现时，证明活动结束，可以铸造nft给用户，返回bool
  function mintTickets(uint256 eventId) internal returns (bool) {
    for (uint256 i = 0; i < tickets[eventId].length; i++) {
      _totalTokes.increment();
      _mint(tickets[eventId][i].owner, _totalTokes.current());
      tickets[eventId][i].minted = true;
    }

    events[eventId].minted = true;
    return true;
  }

  // 辅助函数，将金额支付给指定地址
  function payto(address toAddr, uint256 amount) internal {
    (bool success, ) = payable(toAddr).call{ value: amount }("");
    require(success);
  }

  // 辅助函数，获取当前时间
  function currentTime() internal view returns (uint256) {
    return (block.timestamp * 1000); // block.timestamp 是秒，*1000 是毫秒
  }
}

// 获取我的活动，缺少每个活动买了几张？？
// 票作为 NFT + SBT（Soulbound Token）：门票不可转让，保证真实持有。
// 跨链门票：活动票可以在不同链上流通（跨链桥）。
// DAO 管理：票持有者可以投票决定是否延长活动、变更嘉宾等。
// 账户抽象
