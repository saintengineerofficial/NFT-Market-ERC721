// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketERC1155 is ERC1155, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // 只有EventManager可以铸造
  address public eventManager;

  // eventId => array of tokenIds
  mapping(uint256 => uint256[]) public eventTickets;
  // tokenId => eventId
  mapping(uint256 => uint256) public ticketEvent;
  // tokenId => metadata URI
  mapping(uint256 => string) private _tokenURIs;

  event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed to, string uri, uint256 amount);
  event EventManagerUpdated(address indexed oldManager, address indexed newManager);

  constructor() ERC1155("") {}

  // 设置EventManager地址
  function setEventManager(address _eventManager) external onlyOwner {
    require(_eventManager != address(0), "Invalid address");
    address oldManager = eventManager;
    eventManager = _eventManager;
    emit EventManagerUpdated(oldManager, _eventManager);
  }

  // 只有EventManager可以铸造
  function mintTicket(
    address to,
    uint256 eventId,
    string memory metadataURI,
    uint256 amount
  ) external returns (uint256) {
    require(msg.sender == eventManager, "Only EventManager can mint");
    require(to != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be greater than 0");

    _tokenIds.increment();
    uint256 newId = _tokenIds.current();

    _mint(to, newId, amount, "");
    _tokenURIs[newId] = metadataURI;
    eventTickets[eventId].push(newId);
    ticketEvent[newId] = eventId;

    emit TicketMinted(eventId, newId, to, metadataURI, amount);
    return newId;
  }

  function uri(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return _tokenURIs[tokenId];
  }

  function getEventTickets(uint256 eventId) external view returns (uint256[] memory) {
    return eventTickets[eventId];
  }

  function _exists(uint256 tokenId) internal view returns (bool) {
    return bytes(_tokenURIs[tokenId]).length > 0;
  }

  // 重写转账函数，使票务不可转让（Soulbound Token特性）
  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override {
    // 如果from不是零地址（即不是铸造），则禁止转账
    if (from != address(0)) {
      revert("Tickets are non-transferable");
    }
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }
}
