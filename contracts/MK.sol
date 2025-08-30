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

  uint256 public balance; // ?
  uint256 private servicePct; // 服务费

  mapping(uint256 => EventStruct) events;
  mapping(uint256 => TicketStruct[]) tickets; // 票，每个活动有多个票
  mapping(uint256 => bool) eventExists; // 活动是否存在

  // 初始化
  constructor(uint256 _pct) ERC721("Saint MK", "SMK") {
    servicePct = _pct;
  }

  // 合约部署者行为，创建活动
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

  // 合约部署者行为，更新活动
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

  // 合约部署者行为，删除活动
  function deleteEvent(uint256 eventId) public {
    require(msg.sender == events[eventId].owner || msg.sender == owner(), "You are not the owner of this event");
    require(eventExists[eventId], "Event does not exist");
    require(!events[eventId].deleted, "Event already deleted");
    // 留底记录活动，不能删除
    require(!events[eventId].paidOut, "Event has not been paid out"); //该活动在合约中有金额，不能删除
    require(!events[eventId].refunded, "Event has not been refunded"); //该活动有退款，不能删除

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

  function currentTime() internal view returns (uint256) {
    return (block.timestamp * 1000); // block.timestamp 是秒，*1000 是毫秒
  }
}
