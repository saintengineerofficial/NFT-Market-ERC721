//SPDX-License-Identifier:MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

contract CrossChainMK is Ownable, ReentrancyGuard, ERC721, NonblockingLzApp {
  using Counters for Counters.Counter;
  Counters.Counter private _totalEvents;
  Counters.Counter private _totalTokes;

  // 活动结构体 - 优化后只保留业务逻辑必需的字段
  struct EventStruct {
    uint256 id;
    string metadataURI; // IPFS元数据URI - 包含title, description, imageUrl等
    address owner;
    uint256 ticketCost;
    uint256 capacity; // 容量
    uint256 seats; // 座位数
    uint256 startsAt; // 开始时间
    uint256 endsAt; // 结束时间
    uint256 timestamp; // 创建时间
    bool deleted; // 是否删除
    bool paidOut; // 是否将合约中的金额支付给合约所有者
    bool refunded; // 是否退款，活动取消退款所有用户金额
    bool minted; // 是否铸造
    uint16 sourceChainId; // 来源链ID
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
    uint16 sourceChainId; // 来源链ID
  }

  // 跨链消息类型枚举
  enum MessageType {
    CREATE_EVENT,
    UPDATE_EVENT,
    BUY_TICKET,
    DELETE_EVENT,
    PAYOUT_EVENT
  }

  // 跨链消息结构体
  struct CrossChainMessage {
    MessageType messageType;
    uint256 eventId;
    EventStruct eventData;
    TicketStruct ticketData;
    address user;
    uint256 amount;
  }

  uint256 public balance; // 合约内存放的金额
  uint256 private servicePct; // 服务费

  // 跨链状态管理
  mapping(uint16 => mapping(uint256 => EventStruct)) chainEvents; // 链ID => 事件ID => 事件数据
  mapping(uint16 => mapping(uint256 => TicketStruct[])) chainTickets; // 链ID => 事件ID => 票数组
  mapping(uint16 => mapping(uint256 => bool)) chainEventExists; // 链ID => 事件ID => 是否存在
  mapping(uint16 => Counters.Counter) chainTotalEvents; // 链ID => 事件计数器

  // 本地状态（保持向后兼容）
  mapping(uint256 => EventStruct) events;
  mapping(uint256 => TicketStruct[]) tickets;
  mapping(uint256 => bool) eventExists;
  mapping(address => TicketStruct[]) userTickets;

  // 跨链事件
  event CrossChainEventCreated(uint16 sourceChainId, uint256 eventId, address owner);
  event CrossChainTicketBought(uint16 sourceChainId, uint256 eventId, address buyer, uint256 ticketId);
  event CrossChainEventUpdated(uint16 sourceChainId, uint256 eventId);
  event CrossChainEventDeleted(uint16 sourceChainId, uint256 eventId);

  // 初始化
  constructor(address _lzEndpoint, uint256 _pct) ERC721("CrossChain Saint MK", "CCSMK") NonblockingLzApp(_lzEndpoint) {
    servicePct = _pct;
  }

  // ============ 跨链功能 ============

  // 跨链创建活动
  function createEventCrossChain(
    uint16 _dstChainId,
    string memory metadataURI,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt,
    uint256 _gasForCall
  ) public payable {
    require(bytes(metadataURI).length > 0, "MetadataURI cannot be empty");
    require(capacity > 0, "Capacity must be greater than zero");
    require(ticketCost > 0 ether, "TicketCost must be greater than zero");
    require(startsAt > 0, "StartsAt must be greater than zero");
    require(endsAt > startsAt, "EndsAt must be greater than StartsAt");

    _totalEvents.increment();
    EventStruct memory eventMK;
    eventMK.id = _totalEvents.current();
    eventMK.metadataURI = metadataURI;
    eventMK.capacity = capacity;
    eventMK.ticketCost = ticketCost;
    eventMK.startsAt = startsAt;
    eventMK.endsAt = endsAt;
    eventMK.owner = msg.sender;
    eventMK.timestamp = currentTime();
    eventMK.sourceChainId = uint16(block.chainid);

    // 本地创建
    events[eventMK.id] = eventMK;
    eventExists[eventMK.id] = true;

    // 准备跨链消息
    CrossChainMessage memory message = CrossChainMessage({
      messageType: MessageType.CREATE_EVENT,
      eventId: eventMK.id,
      eventData: eventMK,
      ticketData: TicketStruct(0, 0, address(0), 0, 0, false, false, 0),
      user: msg.sender,
      amount: 0
    });

    // 发送跨链消息
    bytes memory payload = abi.encode(message);
    _lzSend(_dstChainId, payload, payable(msg.sender), address(0), bytes(""), _gasForCall);
  }

  // 跨链购买门票
  function buyTicketsCrossChain(
    uint16 _dstChainId,
    uint256 eventId,
    uint256 numOfticket,
    uint256 _gasForCall
  ) public payable {
    require(eventExists[eventId], "Event not found");
    require(numOfticket > 0, "NumOfticket must be greater than zero");
    require(msg.value >= events[eventId].ticketCost * numOfticket, "Insufficient amount");
    require(events[eventId].seats + numOfticket <= events[eventId].capacity, "Out of seating capacity");

    // 本地购买
    for (uint256 i = 0; i < numOfticket; i++) {
      TicketStruct memory ticket;
      ticket.id = tickets[eventId].length;
      ticket.eventId = eventId;
      ticket.owner = msg.sender;
      ticket.ticketCost = events[eventId].ticketCost;
      ticket.timestamp = currentTime();
      ticket.sourceChainId = uint16(block.chainid);
      tickets[eventId].push(ticket);
      userTickets[msg.sender].push(ticket);
    }

    events[eventId].seats += numOfticket;
    balance = balance + msg.value;

    // 准备跨链消息
    CrossChainMessage memory message = CrossChainMessage({
      messageType: MessageType.BUY_TICKET,
      eventId: eventId,
      eventData: events[eventId],
      ticketData: TicketStruct(
        0,
        eventId,
        msg.sender,
        events[eventId].ticketCost,
        currentTime(),
        false,
        false,
        uint16(block.chainid)
      ),
      user: msg.sender,
      amount: msg.value
    });

    // 发送跨链消息
    bytes memory payload = abi.encode(message);
    _lzSend(_dstChainId, payload, payable(msg.sender), address(0), bytes(""), _gasForCall);
  }

  // 跨链消息接收处理
  function _nonblockingLzReceive(
    uint16 _srcChainId,
    bytes memory _srcAddress,
    uint64 _nonce,
    bytes memory _payload
  ) internal override {
    CrossChainMessage memory message = abi.decode(_payload, (CrossChainMessage));

    if (message.messageType == MessageType.CREATE_EVENT) {
      _handleCrossChainCreateEvent(_srcChainId, message);
    } else if (message.messageType == MessageType.BUY_TICKET) {
      _handleCrossChainBuyTicket(_srcChainId, message);
    } else if (message.messageType == MessageType.UPDATE_EVENT) {
      _handleCrossChainUpdateEvent(_srcChainId, message);
    } else if (message.messageType == MessageType.DELETE_EVENT) {
      _handleCrossChainDeleteEvent(_srcChainId, message);
    } else if (message.messageType == MessageType.PAYOUT_EVENT) {
      _handleCrossChainPayoutEvent(_srcChainId, message);
    }
  }

  // 处理跨链创建活动
  function _handleCrossChainCreateEvent(uint16 _srcChainId, CrossChainMessage memory message) internal {
    chainTotalEvents[_srcChainId].increment();
    message.eventData.id = chainTotalEvents[_srcChainId].current();
    message.eventData.sourceChainId = _srcChainId;

    chainEvents[_srcChainId][message.eventData.id] = message.eventData;
    chainEventExists[_srcChainId][message.eventData.id] = true;

    emit CrossChainEventCreated(_srcChainId, message.eventData.id, message.eventData.owner);
  }

  // 处理跨链购买门票
  function _handleCrossChainBuyTicket(uint16 _srcChainId, CrossChainMessage memory message) internal {
    require(chainEventExists[_srcChainId][message.eventId], "Event not found on source chain");

    TicketStruct memory ticket = message.ticketData;
    ticket.id = chainTickets[_srcChainId][message.eventId].length;
    ticket.sourceChainId = _srcChainId;

    chainTickets[_srcChainId][message.eventId].push(ticket);
    chainEvents[_srcChainId][message.eventId].seats += 1;

    emit CrossChainTicketBought(_srcChainId, message.eventId, message.user, ticket.id);
  }

  // 处理跨链更新活动
  function _handleCrossChainUpdateEvent(uint16 _srcChainId, CrossChainMessage memory message) internal {
    require(chainEventExists[_srcChainId][message.eventId], "Event not found on source chain");

    chainEvents[_srcChainId][message.eventId] = message.eventData;
    emit CrossChainEventUpdated(_srcChainId, message.eventId);
  }

  // 处理跨链删除活动
  function _handleCrossChainDeleteEvent(uint16 _srcChainId, CrossChainMessage memory message) internal {
    require(chainEventExists[_srcChainId][message.eventId], "Event not found on source chain");

    chainEvents[_srcChainId][message.eventId].deleted = true;
    emit CrossChainEventDeleted(_srcChainId, message.eventId);
  }

  // 处理跨链支付活动
  function _handleCrossChainPayoutEvent(uint16 _srcChainId, CrossChainMessage memory message) internal {
    require(chainEventExists[_srcChainId][message.eventId], "Event not found on source chain");

    chainEvents[_srcChainId][message.eventId].paidOut = true;
    chainEvents[_srcChainId][message.eventId].minted = true;
  }

  // ============ 跨链查询功能 ============

  // 获取跨链活动
  function getCrossChainEvents(uint16 _chainId) public view returns (EventStruct[] memory Events) {
    uint256 totalEvents = chainTotalEvents[_chainId].current();
    uint256 available = 0;

    for (uint256 i = 1; i <= totalEvents; i++) {
      if (!chainEvents[_chainId][i].deleted) {
        available++;
      }
    }

    Events = new EventStruct[](available);
    uint256 index = 0;

    for (uint256 i = 1; i <= totalEvents; i++) {
      if (!chainEvents[_chainId][i].deleted) {
        Events[index++] = chainEvents[_chainId][i];
      }
    }
  }

  // 获取跨链单个活动
  function getCrossChainSingleEvent(uint16 _chainId, uint256 eventId) public view returns (EventStruct memory) {
    require(chainEventExists[_chainId][eventId], "Event does not exist on this chain");
    return chainEvents[_chainId][eventId];
  }

  // 获取跨链门票
  function getCrossChainTickets(uint16 _chainId, uint256 eventId) public view returns (TicketStruct[] memory) {
    return chainTickets[_chainId][eventId];
  }

  // ============ 原有功能（保持向后兼容）============

  // 活动主办方，创建活动
  function createEvent(
    string memory metadataURI,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt
  ) public {
    require(bytes(metadataURI).length > 0, "MetadataURI cannot be empty");
    require(capacity > 0, "Capacity must be greater than zero");
    require(ticketCost > 0 ether, "TicketCost must be greater than zero");
    require(startsAt > 0, "StartsAt must be greater than zero");
    require(endsAt > startsAt, "EndsAt must be greater than StartsAt");

    _totalEvents.increment();
    EventStruct memory eventMK;
    eventMK.id = _totalEvents.current();
    eventMK.metadataURI = metadataURI;
    eventMK.capacity = capacity;
    eventMK.ticketCost = ticketCost;
    eventMK.startsAt = startsAt;
    eventMK.endsAt = endsAt;
    eventMK.owner = msg.sender;
    eventMK.timestamp = currentTime();
    eventMK.sourceChainId = uint16(block.chainid);

    events[eventMK.id] = eventMK;
    eventExists[eventMK.id] = true;
  }

  // 活动主办方，更新活动
  function updateEvent(
    uint256 eventId,
    string memory metadataURI,
    uint256 capacity,
    uint256 ticketCost,
    uint256 startsAt,
    uint256 endsAt
  ) public {
    require(msg.sender == events[eventId].owner, "You are not the owner of this event");
    require(eventExists[eventId], "Event does not exist");

    require(bytes(metadataURI).length > 0, "MetadataURI cannot be empty");
    require(capacity > 0, "Capacity must be greater than zero");
    require(ticketCost > 0 ether, "TicketCost must be greater than zero");
    require(startsAt > 0, "StartsAt must be greater than zero");
    require(endsAt > startsAt, "EndsAt must be greater than StartsAt");

    events[eventId].metadataURI = metadataURI;
    events[eventId].capacity = capacity;
    events[eventId].ticketCost = ticketCost;
    events[eventId].startsAt = startsAt;
    events[eventId].endsAt = endsAt;
  }

  // 合约部署者行为/合约部署方，删除活动
  function deleteEvent(uint256 eventId) public {
    require(msg.sender == events[eventId].owner || msg.sender == owner(), "You are not the owner of this event");
    require(eventExists[eventId], "Event does not exist");
    require(!events[eventId].deleted, "Event already deleted");
    require(!events[eventId].paidOut, "Event has not been paid out");
    require(!events[eventId].refunded, "Event has not been refunded");
    require(refundTickets(eventId), "Refund tickets failed");
    events[eventId].deleted = true;
  }

  // 用户行为，获取所有未删除的活动
  function getEvents() public view returns (EventStruct[] memory Events) {
    uint256 available;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        available++;
      }
    }

    Events = new EventStruct[](available);
    uint256 index;
    for (uint256 i = 1; i <= _totalEvents.current(); i++) {
      if (!events[i].deleted) {
        Events[index++] = events[i];
      }
    }
  }

  // 活动主办方，获取他创建的活动
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

  function getUserTickets(address addr) public view returns (TicketStruct[] memory) {
    return userTickets[addr];
  }

  // 用户行为，购买票
  function buyTickets(uint256 eventId, uint256 numOfticket) public payable {
    require(eventExists[eventId], "Event not found");
    require(numOfticket > 0, "NumOfticket must be greater than zero");
    require(msg.value >= events[eventId].ticketCost * numOfticket, "Insufficient amount");
    require(events[eventId].seats + numOfticket <= events[eventId].capacity, "Out of seating capacity");

    for (uint256 i = 0; i < numOfticket; i++) {
      TicketStruct memory ticket;
      ticket.id = tickets[eventId].length;
      ticket.eventId = eventId;
      ticket.owner = msg.sender;
      ticket.ticketCost = events[eventId].ticketCost;
      ticket.timestamp = currentTime();
      ticket.sourceChainId = uint16(block.chainid);
      tickets[eventId].push(ticket);
      userTickets[msg.sender].push(ticket);
    }

    events[eventId].seats += numOfticket;
    balance = balance + msg.value;
  }

  // 用户行为，获取单个活动的票
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
    require(!events[eventId].paidOut, "Event already paid out");
    require(currentTime() > events[eventId].endsAt, "Event still ongoing");
    require(msg.sender == events[eventId].owner || msg.sender == owner(), "Unauthorized entity");
    require(mintTickets(eventId), "Event failed to mint");

    uint256 revenue = events[eventId].seats * events[eventId].ticketCost;
    uint256 fee = (revenue * servicePct) / 100;

    payto(events[eventId].owner, revenue - fee);
    payto(owner(), fee);

    events[eventId].paidOut = true;
    balance -= revenue;
  }

  // 根据票铸造nft给用户
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
    return (block.timestamp * 1000);
  }

  // 设置跨链端点（仅合约所有者）
  function setLzEndpoint(address _lzEndpoint) external onlyOwner {
    lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
  }

  // 设置可信远程地址（仅合约所有者）
  function setTrustedRemote(uint16 _srcChainId, bytes calldata _path) external onlyOwner {
    trustedRemoteLookup[_srcChainId] = _path;
    emit SetTrustedRemote(_srcChainId, _path);
  }

  // 设置可信远程地址（仅合约所有者）
  function setTrustedRemoteAddress(uint16 _remoteChainId, address _remoteAddress) external onlyOwner {
    trustedRemoteLookup[_remoteChainId] = abi.encodePacked(_remoteAddress, address(this));
    emit SetTrustedRemoteAddress(_remoteChainId, _remoteAddress);
  }
}
