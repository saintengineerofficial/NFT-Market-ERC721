// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./TicketERC1155.sol";

contract EventManagerV3 is Ownable, ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _totalEvents;

  struct EventStruct {
    uint256 id;
    string metadataURI;
    address owner;
    uint256 ticketCost;
    uint256 capacity;
    uint256 seats;
    uint256 startsAt;
    uint256 endsAt;
    uint256 timestamp;
    bool deleted;
    bool paidOut;
    bool refunded;
    bool minted;
  }

  struct TicketStruct {
    uint256 id;
    uint256 eventId;
    address owner;
    uint256 ticketCost;
    uint256 timestamp;
    bool refunded;
    bool minted;
  }

  mapping(uint256 => EventStruct) public events;
  mapping(uint256 => TicketStruct[]) public tickets;
  mapping(uint256 => bool) public eventExists;
  mapping(address => TicketStruct[]) public userTickets;

  uint256 public balance;
  uint256 private servicePct;

  TicketERC1155 public ticketERC1155;

  event EventCreated(uint256 indexed id, address indexed owner, string metadataURI);
  event EventUpdated(uint256 indexed id);
  event EventDeleted(uint256 indexed id);
  event TicketPurchased(uint256 indexed eventId, address indexed buyer, uint256 count);
  event EventPaidOut(uint256 indexed eventId, address indexed owner, uint256 revenue, uint256 fee);
  event EventRefunded(uint256 indexed eventId);

  constructor(uint256 _pct, address _ticketERC1155) {
    require(_ticketERC1155 != address(0), "Invalid TicketERC1155");
    servicePct = _pct;
    ticketERC1155 = TicketERC1155(_ticketERC1155);
  }

  // 创建活动
  function createEvent(
    string memory metadataURI,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt
  ) external {
    require(bytes(metadataURI).length > 0, "Empty metadataURI");
    require(capacity > 0, "Capacity=0");
    require(ticketCost > 0, "TicketCost=0");
    require(endsAt > startsAt, "End<Start");

    _totalEvents.increment();
    uint256 eventId = _totalEvents.current();

    EventStruct memory ev;
    ev.id = eventId;
    ev.metadataURI = metadataURI;
    ev.capacity = capacity;
    ev.ticketCost = ticketCost;
    ev.startsAt = startsAt;
    ev.endsAt = endsAt;
    ev.owner = msg.sender;
    ev.timestamp = block.timestamp;

    events[eventId] = ev;
    eventExists[eventId] = true;

    emit EventCreated(eventId, msg.sender, metadataURI);
  }

  // 更新活动
  function updateEvent(
    uint256 eventId,
    string memory metadataURI,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt
  ) external {
    require(eventExists[eventId], "No event");
    EventStruct storage ev = events[eventId];
    require(ev.owner == msg.sender, "Not owner");
    require(!ev.deleted, "Deleted");

    ev.metadataURI = metadataURI;
    ev.capacity = capacity;
    ev.ticketCost = ticketCost;
    ev.startsAt = startsAt;
    ev.endsAt = endsAt;

    emit EventUpdated(eventId);
  }

  // 购买票
  function buyTickets(uint256 eventId, uint256 count) external payable {
    require(eventExists[eventId], "No event");
    EventStruct storage ev = events[eventId];
    require(count > 0, "Invalid count");
    require(msg.value >= ev.ticketCost * count, "Not enough ETH");
    require(ev.seats + count <= ev.capacity, "Full");

    for (uint256 i = 0; i < count; i++) {
      TicketStruct memory t;
      t.id = tickets[eventId].length;
      t.eventId = eventId;
      t.owner = msg.sender;
      t.ticketCost = ev.ticketCost;
      t.timestamp = block.timestamp;
      tickets[eventId].push(t);
      userTickets[msg.sender].push(t);
    }

    ev.seats += count;
    balance += msg.value;

    emit TicketPurchased(eventId, msg.sender, count);
  }

  // 退款
  function refundTickets(uint256 eventId) internal returns (bool) {
    EventStruct storage ev = events[eventId];
    require(!ev.refunded, "Already refunded");

    for (uint256 i = 0; i < tickets[eventId].length; i++) {
      TicketStruct storage t = tickets[eventId][i];
      if (!t.refunded) {
        _pay(t.owner, t.ticketCost);
        t.refunded = true;
        balance -= t.ticketCost;
      }
    }

    ev.refunded = true;
    emit EventRefunded(eventId);
    return true;
  }

  // 删除活动（触发退款）
  function deleteEvent(uint256 eventId) external {
    EventStruct storage ev = events[eventId];
    require(eventExists[eventId], "No event");
    require(msg.sender == ev.owner || msg.sender == owner(), "Unauthorized");
    require(!ev.deleted, "Deleted");
    require(!ev.paidOut, "Paid out");

    refundTickets(eventId);
    ev.deleted = true;
    emit EventDeleted(eventId);
  }

  // 活动结束提现 + 铸造ERC1155票
  function payOut(uint256 eventId) external nonReentrant {
    EventStruct storage ev = events[eventId];
    require(eventExists[eventId], "No event");
    require(!ev.paidOut, "Paid out");
    require(block.timestamp > ev.endsAt, "Event ongoing");
    require(msg.sender == ev.owner || msg.sender == owner(), "Unauthorized");

    // mint ERC1155 tokens
    for (uint256 i = 0; i < tickets[eventId].length; i++) {
      TicketStruct storage t = tickets[eventId][i];
      if (!t.minted && !t.refunded) {
        ticketERC1155.mintTicket(t.owner, eventId, ev.metadataURI, 1);
        t.minted = true;
      }
    }

    // payout
    uint256 revenue = ev.seats * ev.ticketCost;
    uint256 fee = (revenue * servicePct) / 100;
    _pay(ev.owner, revenue - fee);
    _pay(owner(), fee);
    balance -= revenue;

    ev.paidOut = true;
    ev.minted = true;

    emit EventPaidOut(eventId, ev.owner, revenue, fee);
  }

  // 查询函数
  function getEvents() external view returns (EventStruct[] memory) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        available++;
      }
    }

    EventStruct[] memory result = new EventStruct[](available);
    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        result[index++] = events[i];
      }
    }
    return result;
  }

  function getMyEvents() external view returns (EventStruct[] memory) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted && events[i].owner == msg.sender) {
        available++;
      }
    }

    EventStruct[] memory result = new EventStruct[](available);
    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted && events[i].owner == msg.sender) {
        result[index++] = events[i];
      }
    }
    return result;
  }

  function getSingleEvent(uint256 eventId) external view returns (EventStruct memory) {
    require(eventExists[eventId], "Event does not exist");
    return events[eventId];
  }

  function getTickets(uint256 eventId) external view returns (TicketStruct[] memory) {
    return tickets[eventId];
  }

  function getUserTickets(address addr) external view returns (TicketStruct[] memory) {
    return userTickets[addr];
  }

  function _pay(address to, uint256 amount) internal {
    (bool success, ) = payable(to).call{ value: amount }("");
    require(success, "Payment failed");
  }
}
