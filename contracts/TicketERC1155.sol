// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// EventManager接口
interface IEventManager {
  function canTransferTicket(uint256 eventId) external view returns (bool);
}

contract TicketERC1155 is ERC1155, Ownable {
  // 只有EventManager可以铸造
  address public eventManager;

  // tokenId => metadata URI
  mapping(uint256 => string) private _tokenURIs;
  
  // 记录所有已存在的tokenId（用于遍历）
  mapping(uint256 => bool) private _existsTokenIds;
  uint256[] private _allTokenIds;

  event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed to, string uri, uint256 amount);
  event TicketsBurned(uint256 indexed tokenId, address indexed from, uint256 amount);
  event EventManagerUpdated(address indexed oldManager, address indexed newManager);

  constructor() ERC1155("") {}

  // 设置EventManager地址
  function setEventManager(address _eventManager) external onlyOwner {
    require(_eventManager != address(0), "Invalid address");
    address oldManager = eventManager;
    eventManager = _eventManager;
    emit EventManagerUpdated(oldManager, _eventManager);
  }

  // 只有EventManager可以铸造单个tokenId的门票
  function mintTicket(
    address to,
    uint256 tokenId,
    string memory metadataURI,
    uint256 amount
  ) external {
    require(msg.sender == eventManager, "Only EventManager can mint");
    require(to != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be greater than 0");

    // 如果这个tokenId还没有设置URI，则设置
    if (bytes(_tokenURIs[tokenId]).length == 0) {
      _tokenURIs[tokenId] = metadataURI;
      _existsTokenIds[tokenId] = true;
      _allTokenIds.push(tokenId);
    }

    _mint(to, tokenId, amount, "");
    
    // 从tokenId解析eventId (tokenId = eventId * 1000 + ticketType)
    uint256 eventId = tokenId / 1000;
    emit TicketMinted(eventId, tokenId, to, metadataURI, amount);
  }

  // 批量铸造多种类型门票
  function mintBatch(
    address to,
    uint256[] memory tokenIds,
    uint256[] memory amounts,
    string[] memory uris
  ) external {
    require(msg.sender == eventManager, "Only EventManager can mint");
    require(to != address(0), "Invalid recipient");
    require(tokenIds.length == amounts.length && amounts.length == uris.length, "Length mismatch");

    // 设置每个tokenId的URI
    for (uint256 i = 0; i < tokenIds.length; i++) {
      require(amounts[i] > 0, "Amount must be greater than 0");
      
      if (bytes(_tokenURIs[tokenIds[i]]).length == 0) {
        _tokenURIs[tokenIds[i]] = uris[i];
        if (!_existsTokenIds[tokenIds[i]]) {
          _existsTokenIds[tokenIds[i]] = true;
          _allTokenIds.push(tokenIds[i]);
        }
      }
    }

    _mintBatch(to, tokenIds, amounts, "");
    
    // 触发事件
    for (uint256 i = 0; i < tokenIds.length; i++) {
      uint256 eventId = tokenIds[i] / 1000;
      emit TicketMinted(eventId, tokenIds[i], to, uris[i], amounts[i]);
    }
  }

  // 销毁门票
  function burn(address from, uint256 tokenId, uint256 amount) external {
    require(msg.sender == eventManager || msg.sender == from, "Not authorized");
    require(amount > 0, "Amount must be greater than 0");
    
    _burn(from, tokenId, amount);
    emit TicketsBurned(tokenId, from, amount);
  }

  // 批量销毁门票
  function burnBatch(address from, uint256[] memory tokenIds, uint256[] memory amounts) external {
    require(msg.sender == eventManager || msg.sender == from, "Not authorized");
    require(tokenIds.length == amounts.length, "Length mismatch");
    
    _burnBatch(from, tokenIds, amounts);
    
    for (uint256 i = 0; i < tokenIds.length; i++) {
      emit TicketsBurned(tokenIds[i], from, amounts[i]);
    }
  }

  // IERC1155MetadataURI，重写uri函数
  function uri(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return _tokenURIs[tokenId];
  }

  function _exists(uint256 tokenId) internal view returns (bool) {
    return bytes(_tokenURIs[tokenId]).length > 0;
  }

  // 获取用户拥有的所有门票信息
  function getUserTokens(address user) external view returns (uint256[] memory tokenIds, uint256[] memory amounts) {
    uint256 count = 0;
    
    // 先计算用户拥有的代币数量
    for (uint256 i = 0; i < _allTokenIds.length; i++) {
      if (balanceOf(user, _allTokenIds[i]) > 0) {
        count++;
      }
    }
    
    // 分配数组
    tokenIds = new uint256[](count);
    amounts = new uint256[](count);
    
    // 填充数组
    uint256 index = 0;
    for (uint256 i = 0; i < _allTokenIds.length; i++) {
      uint256 tokenId = _allTokenIds[i];
      uint256 balance = balanceOf(user, tokenId);
      if (balance > 0) {
        tokenIds[index] = tokenId;
        amounts[index] = balance;
        index++;
      }
    }
    
    return (tokenIds, amounts);
  }

  // 获取用户拥有的某个活动的某个票种门票数量
  function getUserTicketBalance(address user, uint256 eventId, uint256 ticketType) external view returns (uint256) {
    uint256 tokenId = eventId * 1000 + ticketType;
    return balanceOf(user, tokenId);
  }

  // 重写转账函数，添加转让限制
  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override {
    // 如果EventManager已设置，检查转让限制
    if (eventManager != address(0)) {
      // 从tokenId解析eventId
      for (uint256 i = 0; i < ids.length; i++) {
        uint256 eventId = ids[i] / 1000;
        
        // 检查活动是否允许转让（不是mint或burn操作）
        if (from != address(0) && to != address(0)) {
          // 调用EventManager检查是否允许转让
          bool canTransfer = IEventManager(eventManager).canTransferTicket(eventId);
          require(canTransfer, "Ticket transfer not allowed before event ends");
        }
      }
    }
    
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }
}