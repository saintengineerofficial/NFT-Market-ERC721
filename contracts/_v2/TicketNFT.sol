// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketNFT is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // eventId => array of tokenIds
  mapping(uint256 => uint256[]) public eventTickets;
  // tokenId => eventId
  mapping(uint256 => uint256) public ticketEvent;
  // tokenId => metadata URI
  mapping(uint256 => string) private _tokenURIs;

  // 只有EventManager可以铸造
  address public eventManager;

  event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed to, string uri);
  event EventManagerUpdated(address indexed oldManager, address indexed newManager);

  constructor() ERC721("Saint Ticket NFT", "STK") {}

  // 设置EventManager地址
  function setEventManager(address _eventManager) external onlyOwner {
    require(_eventManager != address(0), "Invalid address");
    address oldManager = eventManager;
    eventManager = _eventManager;
    emit EventManagerUpdated(oldManager, _eventManager);
  }

  // 只有EventManager可以铸造
  function mintTicket(address to, uint256 eventId, string memory uri) external returns (uint256) {
    require(msg.sender == eventManager, "Only EventManager can mint");
    require(to != address(0), "Invalid recipient");

    _tokenIds.increment();
    uint256 newId = _tokenIds.current();

    _safeMint(to, newId);
    _tokenURIs[newId] = uri;
    eventTickets[eventId].push(newId);
    ticketEvent[newId] = eventId;

    emit TicketMinted(eventId, newId, to, uri);
    return newId;
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return _tokenURIs[tokenId];
  }

  function getEventTickets(uint256 eventId) external view returns (uint256[] memory) {
    return eventTickets[eventId];
  }
}
