// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./TicketERC1155.sol";

contract EventManager is Ownable, ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _totalEvents;

  enum TicketType {
    GENERAL,    // 普通票，1
    VIP,        // VIP票，2
    EARLY_BIRD  // 早鸟票，3
  }

  // 门票类型信息结构
  struct TicketTypeInfo {
    TicketType ticketType;
    string name;
    uint256 price;
    uint256 capacity;
    uint256 sold;
    string metadataURI;
    bool active;
  }

  struct EventStruct {
    uint256 id;
    string metadataURI;
    address owner;
    uint256 startsAt;
    uint256 endsAt;
    uint256 timestamp;
    bool deleted;
    bool paidOut;
    bool refunded;
    bool minted;
    // 门票类型信息
    mapping(TicketType => TicketTypeInfo) ticketTypes;
    TicketType[] activeTicketTypes;
  }

  // 购买记录
  struct TicketPurchaseRecord {
    address buyer;
    uint256 eventId;
    TicketType ticketType;
    uint256 count;
    uint256 totalCost;
    uint256 timestamp;
  }

  // 检票记录
  struct CheckInRecord {
    address attendee;
    TicketType ticketType;
    uint256 timestamp;
    address checker;
  }

  mapping(uint256 => EventStruct) public events;
  mapping(uint256 => bool) public eventExists;
  mapping(uint256 => TicketPurchaseRecord[]) public purchaseRecords; // 购买记录
  mapping(uint256 => mapping(address => CheckInRecord)) public checkInRecords; // 检票记录
  mapping(uint256 => mapping(address => bool)) public eventCheckers; // 检票员权限
  mapping(uint256 => mapping(address => bool)) public checkedTickets; // 是否已检票
  mapping(bytes32 => bool) public usedTickets; // 已使用的门票
  mapping(bytes32 => bool) public refundedTickets; // 已退款的记录

  uint256 public balance;
  uint256 private servicePct;

  // NFT门票合约
  TicketERC1155 public ticketERC1155;

  // 事件
  event EventCreated(uint256 indexed id, address indexed owner, string metadataURI);
  event EventUpdated(uint256 indexed id);
  event EventDeleted(uint256 indexed id);
  event TicketPurchased(uint256 indexed eventId, address indexed buyer, TicketType ticketType, uint256 count);
  // event BatchTicketPurchased(uint256 indexed eventId, address indexed buyer, TicketType[] ticketTypes, uint256[] counts); // 已注释：批量购买多种门票功能暂不使用
  event EventPaidOut(uint256 indexed eventId, address indexed owner, uint256 revenue, uint256 fee);
  event EventRefunded(uint256 indexed eventId);
  event TicketChecked(uint256 indexed eventId, address indexed checker, address indexed attendee, TicketType ticketType);
  event CheckerAdded(uint256 indexed eventId, address indexed checker);
  event CheckerRemoved(uint256 indexed eventId, address indexed checker);
  event TicketTypeAdded(uint256 indexed eventId, TicketType ticketType);
  event TicketTypeUpdated(uint256 indexed eventId, TicketType ticketType);
  event PersonalRefund(uint256 indexed eventId, address indexed buyer, TicketType ticketType, uint256 count, uint256 refundAmount);


  constructor(uint256 _pct, address _ticketERC1155) {
    require(_ticketERC1155 != address(0), "Invalid TicketERC1155");
    servicePct = _pct;
    // 设置NFT门票合约地址
    ticketERC1155 = TicketERC1155(_ticketERC1155);
  }

  // 创建多类型门票活动
  function createEventWithTicketTypes(
    string memory metadataURI,
    uint256 startsAt,
    uint256 endsAt,
    TicketTypeInfo[] memory ticketTypeInfos
  ) external {
    require(bytes(metadataURI).length > 0, "Empty metadataURI");
    require(endsAt > startsAt, "End<Start");
    require(ticketTypeInfos.length > 0, "No ticket types");

    _totalEvents.increment();
    uint256 eventId = _totalEvents.current();

    EventStruct storage ev = events[eventId];
    ev.id = eventId;
    ev.metadataURI = metadataURI;
    ev.startsAt = startsAt;
    ev.endsAt = endsAt;
    ev.owner = msg.sender;
    ev.timestamp = block.timestamp;

    // 设置每种门票类型
    for (uint256 i = 0; i < ticketTypeInfos.length; i++) {
      TicketTypeInfo memory info = ticketTypeInfos[i];
      require(info.price > 0, "Invalid price");
      require(info.capacity > 0, "Invalid capacity");
      require(bytes(info.metadataURI).length > 0, "Empty metadataURI");
      
      // 存储门票类型信息
      ev.ticketTypes[info.ticketType] = TicketTypeInfo({
        ticketType: info.ticketType,
        name: info.name,
        price: info.price,
        capacity: info.capacity,
        sold: 0,
        metadataURI: info.metadataURI,
        active: true
      });
      
      ev.activeTicketTypes.push(info.ticketType);
    }

    eventExists[eventId] = true;

    emit EventCreated(eventId, msg.sender, metadataURI);
  }

  // 添加新的门票类型到已有活动，暂不使用
  // function addTicketType(
  //   uint256 eventId,
  //   TicketTypeInfo memory ticketTypeInfo
  // ) external {
  //   require(eventExists[eventId], "Event not exists");
  //   // 获取活动信息
  //   EventStruct storage ev = events[eventId];

  //   require(ev.owner == msg.sender, "Not owner");
  //   require(!ev.deleted, "Event deleted");
  //   require(ev.ticketTypes[ticketTypeInfo.ticketType].capacity == 0, "Ticket type already exists");
    
  //   ev.ticketTypes[ticketTypeInfo.ticketType] = TicketTypeInfo({
  //     ticketType: ticketTypeInfo.ticketType,
  //     name: ticketTypeInfo.name,
  //     price: ticketTypeInfo.price,
  //     capacity: ticketTypeInfo.capacity,
  //     sold: 0,
  //     metadataURI: ticketTypeInfo.metadataURI,
  //     active: true
  //   });
    
  //   ev.activeTicketTypes.push(ticketTypeInfo.ticketType);
    
  //   emit TicketTypeAdded(eventId, ticketTypeInfo.ticketType);
  // }

  // 更新活动信息,只能更新开始时间、结束时间、元数据URI
  function updateEvent(
    uint256 eventId,
    string memory metadataURI,
    uint256 startsAt,
    uint256 endsAt
  ) external {
    require(eventExists[eventId], "No event");
    EventStruct storage ev = events[eventId];
    require(ev.owner == msg.sender, "Not owner");
    require(!ev.deleted, "Deleted");
    require(endsAt > startsAt, "End<Start");

    ev.metadataURI = metadataURI;
    ev.startsAt = startsAt;
    ev.endsAt = endsAt;

    emit EventUpdated(eventId);
  }

  // 更新票种信息
  function updateTicketType(
    uint256 eventId,
    TicketType ticketType,
    string memory name,
    uint256 newPrice,
    uint256 newCapacity,
    string memory metadataURI,
    bool active
  ) external {
    require(eventExists[eventId], "Event not exists");
    EventStruct storage ev = events[eventId];
    require(ev.owner == msg.sender, "Not owner");
    require(!ev.deleted, "Event deleted");
    
    TicketTypeInfo storage ticketInfo = ev.ticketTypes[ticketType];
    require(ticketInfo.capacity > 0, "Ticket type not exists");
    
    // 新容量不能小于已售数量
    require(newCapacity >= ticketInfo.sold, "Capacity too small");
    
    ticketInfo.name = name;
    ticketInfo.price = newPrice;
    ticketInfo.capacity = newCapacity;
    ticketInfo.metadataURI = metadataURI;
    ticketInfo.active = active;
    
    emit TicketTypeUpdated(eventId, ticketType);
  }

  // 购买单种门票（立即mint NFT）
  function buyTicketsByType(
    uint256 eventId,
    TicketType ticketType,
    uint256 count
  ) external payable {
    require(eventExists[eventId], "No event");
    EventStruct storage ev = events[eventId];
    require(count > 0, "Invalid count");
    require(block.timestamp < ev.startsAt, "Event already started");

    TicketTypeInfo storage ticketInfo = ev.ticketTypes[ticketType];
    require(ticketInfo.active, "Ticket type not active");
    require(msg.value >= ticketInfo.price * count, "Not enough ETH");
    require(ticketInfo.sold + count <= ticketInfo.capacity, "Ticket type sold out");

    // 生成tokenId: eventId * 1000 + ticketType
    uint256 tokenId = eventId * 1000 + uint256(ticketType);
    
    // 立即mint NFT门票给用户
    ticketERC1155.mintTicket(msg.sender, tokenId, ticketInfo.metadataURI, count);

    // 记录购买信息
    TicketPurchaseRecord memory record = TicketPurchaseRecord({
      buyer: msg.sender,
      eventId: eventId,
      ticketType: ticketType,
      count: count,
      totalCost: ticketInfo.price * count,
      timestamp: block.timestamp
    });
    
    purchaseRecords[eventId].push(record);

    ticketInfo.sold += count;
    balance += msg.value;

    emit TicketPurchased(eventId, msg.sender, ticketType, count);
  }

  // 个人退款函数
  function personalRefund(uint256 eventId, TicketType ticketType, uint256 count) external nonReentrant {
    require(eventExists[eventId], "Event not exists");
    EventStruct storage ev = events[eventId];
    
    // 必须在活动开始前3天退款
    require(block.timestamp < ev.startsAt - 3 days, "Refund deadline passed");
    
    uint256 tokenId = eventId * 1000 + uint256(ticketType);
    uint256 userBalance = ticketERC1155.balanceOf(msg.sender, tokenId);
    require(userBalance > 0, "No tickets to refund");
    
    // 确定退款数量
    uint256 refundCount = count == 0 ? userBalance : (count > userBalance ? userBalance : count);
    uint256 refundAmount = ev.ticketTypes[ticketType].price * refundCount;
    ticketERC1155.burn(msg.sender, tokenId, refundCount);
    
    // 更新已售数量
    ev.ticketTypes[ticketType].sold -= refundCount;
    balance -= refundAmount;
    
    // 退款
    _pay(msg.sender, refundAmount);
    
    emit PersonalRefund(eventId, msg.sender, ticketType, refundCount, refundAmount);
  }

  // 批量购买多种类型门票（ERC1155核心优势）
  // 已注释：实际业务场景中一次只能购买一种类型的门票
  /*
  function buyMultipleTicketTypes(
    uint256 eventId,
    TicketType[] memory ticketTypes,
    uint256[] memory counts
  ) external payable {
    require(ticketTypes.length == counts.length, "Length mismatch");
    require(eventExists[eventId], "No event");
    
    EventStruct storage ev = events[eventId];
    require(block.timestamp < ev.startsAt, "Event already started");

    uint256 totalCost = 0;
    uint256[] memory tokenIds = new uint256[](ticketTypes.length);
    uint256[] memory amounts = new uint256[](ticketTypes.length);
    string[] memory uris = new string[](ticketTypes.length);

    // 验证并计算总价
    for (uint256 i = 0; i < ticketTypes.length; i++) {
      TicketTypeInfo storage ticketInfo = ev.ticketTypes[ticketTypes[i]];
      require(ticketInfo.active, "Ticket type not active");
      require(ticketInfo.sold + counts[i] <= ticketInfo.capacity, "Sold out");
      
      totalCost += ticketInfo.price * counts[i];
      tokenIds[i] = eventId * 1000 + uint256(ticketTypes[i]);
      amounts[i] = counts[i];
      uris[i] = ticketInfo.metadataURI;
      
      ticketInfo.sold += counts[i];
      
      // 记录购买信息
      purchaseRecords[eventId].push(TicketPurchaseRecord({
        buyer: msg.sender,
        eventId: eventId,
        ticketType: ticketTypes[i],
        count: counts[i],
        totalCost: ticketInfo.price * counts[i],
        timestamp: block.timestamp
      }));
    }

    require(msg.value >= totalCost, "Not enough ETH");

    // 批量mint - 这是ERC1155的核心优势！
    ticketERC1155.mintBatch(msg.sender, tokenIds, amounts, uris);

    balance += msg.value;
    emit BatchTicketPurchased(eventId, msg.sender, ticketTypes, counts);
  }
  */

  // 退款函数（需要burn掉NFT门票）
  function refundTickets(uint256 eventId) internal returns (bool) {
    EventStruct storage ev = events[eventId];
    require(!ev.refunded, "Already refunded");

    // 遍历所有购买记录
    for (uint256 i = 0; i < purchaseRecords[eventId].length; i++) {
      TicketPurchaseRecord storage record = purchaseRecords[eventId][i];
      
      // 检查是否已检票（如果已检票则不能退款）
      bytes32 checkInKey = keccak256(abi.encodePacked(eventId, record.buyer, record.ticketType));
      if (usedTickets[checkInKey]) {
        continue; // 已使用的门票不能退款
      }

      // 计算tokenId并burn掉NFT
      uint256 tokenId = eventId * 1000 + uint256(record.ticketType);
      uint256 userBalance = ticketERC1155.balanceOf(record.buyer, tokenId);
      
      if (userBalance > 0) {
        // Burn掉用户的NFT门票
        ticketERC1155.burn(record.buyer, tokenId, userBalance);
      }

      // 退款
      _pay(record.buyer, record.totalCost);
      
      // 更新已售数量
      ev.ticketTypes[record.ticketType].sold -= record.count;
      balance -= record.totalCost;
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

  // 添加检票员
  function addChecker(uint256 eventId, address checker) external {
    EventStruct storage ev = events[eventId];
    require(ev.owner == msg.sender || msg.sender == owner(), "Not authorized");
    require(eventExists[eventId], "Event not exists");
    
    eventCheckers[eventId][checker] = true;
    emit CheckerAdded(eventId, checker);
  }

  // 移除检票员
  function removeChecker(uint256 eventId, address checker) external {
    EventStruct storage ev = events[eventId];
    require(ev.owner == msg.sender || msg.sender == owner(), "Not authorized");
    
    eventCheckers[eventId][checker] = false;
    emit CheckerRemoved(eventId, checker);
  }

  // burn掉NFT，目前不考虑使用
  // function checkInWithBurn(
  //   uint256 eventId,
  //   address attendee,
  //   TicketType ticketType
  // ) external {
  //   require(eventCheckers[eventId][msg.sender], "Not authorized checker");
  //   require(eventExists[eventId], "Event not exists");

  //   uint256 tokenId = eventId * 1000 + uint256(ticketType);
  //   uint256 nftBalance = ticketERC1155.balanceOf(attendee, tokenId);
  //   require(nftBalance > 0, "No valid ticket");

  //   // Burn掉一张门票
  //   ticketERC1155.burn(attendee, tokenId, 1);

  //   // 记录检票
  //   checkInRecords[eventId][attendee] = CheckInRecord({
  //     attendee: attendee,
  //     ticketType: ticketType,
  //     timestamp: block.timestamp,
  //     checker: msg.sender
  //   });

  //   checkedTickets[eventId][attendee] = true;

  //   emit TicketChecked(eventId, msg.sender, attendee, ticketType);
  // }

  // 保留门票但标记已使用
  function checkInWithMark(
    uint256 eventId,
    address attendee,
    TicketType ticketType
  ) external {
    require(eventCheckers[eventId][msg.sender], "Not authorized checker");
    require(eventExists[eventId], "Event not exists");

    uint256 tokenId = eventId * 1000 + uint256(ticketType);
    uint256 nftBalance = ticketERC1155.balanceOf(attendee, tokenId);
    require(nftBalance > 0, "No valid ticket");

    // 检查是否已经检票
    bytes32 checkInKey = keccak256(abi.encodePacked(eventId, attendee, ticketType));
    require(!usedTickets[checkInKey], "Already checked in");
    
    usedTickets[checkInKey] = true;

    // 记录检票
    checkInRecords[eventId][attendee] = CheckInRecord({
      attendee: attendee,
      ticketType: ticketType,
      timestamp: block.timestamp,
      checker: msg.sender
    });

    checkedTickets[eventId][attendee] = true;

    emit TicketChecked(eventId, msg.sender, attendee, ticketType);
  }

  // 批量检票，废弃，不考虑使用
  function batchCheckIn(
    uint256 eventId,
    address[] memory attendees,
    TicketType[] memory ticketTypes
  ) external {
    // 统一在循环外验证，避免重复检查
    require(eventExists[eventId], "Event not exists");
    require(eventCheckers[eventId][msg.sender], "Not authorized");
    require(attendees.length == ticketTypes.length, "Length mismatch");
    
    EventStruct storage ev = events[eventId];
    require(!ev.deleted, "Event deleted");
    require(block.timestamp >= ev.startsAt, "Event not started");

    // 循环内只处理每个人的检票逻辑
    for (uint256 i = 0; i < attendees.length; i++) {
      uint256 tokenId = eventId * 1000 + uint256(ticketTypes[i]);
      uint256 nftBalance = ticketERC1155.balanceOf(attendees[i], tokenId);
      require(nftBalance > 0, "No valid ticket");
      
      bytes32 checkInKey = keccak256(abi.encodePacked(eventId, attendees[i], ticketTypes[i]));
      require(!usedTickets[checkInKey], "Already checked in");
      usedTickets[checkInKey] = true;
      
      // 记录检票（如果同一人有多个票种，后面的会覆盖前面的记录）
      checkInRecords[eventId][attendees[i]] = CheckInRecord({
        attendee: attendees[i],
        ticketType: ticketTypes[i],
        timestamp: block.timestamp,
        checker: msg.sender
      });
      
      checkedTickets[eventId][attendees[i]] = true;
      emit TicketChecked(eventId, msg.sender, attendees[i], ticketTypes[i]);
    }
  }

  // 查询是否已检票
  function isCheckedIn(uint256 eventId, address attendee) external view returns (bool) {
    return checkedTickets[eventId][attendee];
  }

  // 查询用户的某个票种门票数量
  function getUserTicketBalance(uint256 eventId, address user, TicketType ticketType) external view returns (uint256) {
    uint256 tokenId = eventId * 1000 + uint256(ticketType);
    return ticketERC1155.balanceOf(user, tokenId);
  }

  // 活动结束提现
  function payOut(uint256 eventId) external nonReentrant {
    EventStruct storage ev = events[eventId];
    require(eventExists[eventId], "No event");
    require(!ev.paidOut, "Paid out");
    require(block.timestamp > ev.endsAt, "Event ongoing");
    require(msg.sender == ev.owner || msg.sender == owner(), "Unauthorized");

    // 计算总收益（所有票种的总和）
    uint256 totalRevenue = 0;
    for (uint256 i = 0; i < ev.activeTicketTypes.length; i++) {
      TicketType ticketType = ev.activeTicketTypes[i];
      TicketTypeInfo storage ticketInfo = ev.ticketTypes[ticketType];
      totalRevenue += ticketInfo.price * ticketInfo.sold;
    }

    // 分配收益
    uint256 fee = (totalRevenue * servicePct) / 100;
    _pay(ev.owner, totalRevenue - fee);
    _pay(owner(), fee);
    balance -= totalRevenue;

    ev.paidOut = true;

    emit EventPaidOut(eventId, ev.owner, totalRevenue, fee);
  }

  // 查询活动信息
  function getSingleEvent(uint256 eventId) external view returns (
    uint256 id,
    string memory metadataURI,
    address owner,
    uint256 startsAt,
    uint256 endsAt,
    uint256 timestamp,
    bool deleted,
    bool paidOut,
    bool refunded,
    bool minted
  ) {
    require(eventExists[eventId], "Event does not exist");
    EventStruct storage ev = events[eventId];
    return (
      ev.id,
      ev.metadataURI,
      ev.owner,
      ev.startsAt,
      ev.endsAt,
      ev.timestamp,
      ev.deleted,
      ev.paidOut,
      ev.refunded,
      ev.minted
    );
  }

  // 查询活动的某个票种信息
  function getTicketTypeInfo(uint256 eventId, TicketType ticketType) external view returns (TicketTypeInfo memory) {
    require(eventExists[eventId], "Event not exists");
    return events[eventId].ticketTypes[ticketType];
  }

  // 查询活动的所有活跃票种
  function getActiveTicketTypes(uint256 eventId) external view returns (TicketType[] memory) {
    require(eventExists[eventId], "Event not exists");
    return events[eventId].activeTicketTypes;
  }

  // 查询所有活动ID
  function getEvents() external view returns (uint256[] memory) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        available++;
      }
    }

    uint256[] memory result = new uint256[](available);
    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        result[index++] = i;
      }
    }
    return result;
  }

  // 查询我创建的活动ID
  function getMyEvents() external view returns (uint256[] memory) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted && events[i].owner == msg.sender) {
        available++;
      }
    }

    uint256[] memory result = new uint256[](available);
    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted && events[i].owner == msg.sender) {
        result[index++] = i;
      }
    }
    return result;
  }

  // 查询用户的购买记录
  function getUserPurchaseRecords(uint256 eventId, address user) external view returns (TicketPurchaseRecord[] memory) {
    TicketPurchaseRecord[] memory userRecords = new TicketPurchaseRecord[](0);
    uint256 count = 0;
    
    for (uint256 i = 0; i < purchaseRecords[eventId].length; i++) {
      if (purchaseRecords[eventId][i].buyer == user) {
        count++;
      }
    }
    
    userRecords = new TicketPurchaseRecord[](count);
    uint256 index = 0;
    
    for (uint256 i = 0; i < purchaseRecords[eventId].length; i++) {
      if (purchaseRecords[eventId][i].buyer == user) {
        userRecords[index] = purchaseRecords[eventId][i];
        index++;
      }
    }
    
    return userRecords;
  }

  // 查询用户持有的门票类型
  function getUserTicketTypes(uint256 eventId, address user) external view returns (TicketType[] memory, uint256[] memory) {
    EventStruct storage ev = events[eventId];
    TicketType[] memory userTicketTypes = new TicketType[](0);
    uint256[] memory balances = new uint256[](0);
    uint256 count = 0;
    
    // 先计算用户拥有的票种数量
    for (uint256 i = 0; i < ev.activeTicketTypes.length; i++) {
      TicketType ticketType = ev.activeTicketTypes[i];
      uint256 tokenId = eventId * 1000 + uint256(ticketType);
      if (ticketERC1155.balanceOf(user, tokenId) > 0) {
        count++;
      }
    }
    
    // 分配数组
    userTicketTypes = new TicketType[](count);
    balances = new uint256[](count);
    uint256 index = 0;
    
    for (uint256 i = 0; i < ev.activeTicketTypes.length; i++) {
      TicketType ticketType = ev.activeTicketTypes[i];
      uint256 tokenId = eventId * 1000 + uint256(ticketType);
      uint256 ticketBalance = ticketERC1155.balanceOf(user, tokenId);
      if (ticketBalance > 0) {
        userTicketTypes[index] = ticketType;
        balances[index] = ticketBalance;
        index++;
      }
    }
    
    return (userTicketTypes, balances);
  }

  // 查询检票记录
  function getCheckInRecord(uint256 eventId, address attendee) external view returns (CheckInRecord memory) {
    return checkInRecords[eventId][attendee];
  }

  // 生成tokenId的辅助函数
  function generateTokenId(uint256 eventId, TicketType ticketType) public pure returns (uint256) {
    return eventId * 1000 + uint256(ticketType);
  }

  // 查询门票是否允许转让
  function canTransferTicket(uint256 eventId) external view returns (bool) {
    require(eventExists[eventId], "Event not exists");
    EventStruct storage ev = events[eventId];
    // 活动结束后才能转让
    return block.timestamp >= ev.endsAt;
  }

  function _pay(address to, uint256 amount) internal {
    (bool success, ) = payable(to).call{ value: amount }("");
    require(success, "Payment failed");
  }
}
