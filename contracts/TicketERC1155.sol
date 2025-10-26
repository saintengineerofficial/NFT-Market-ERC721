// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketERC1155 is ERC1155, Ownable {
  // 只有EventManager可以铸造
  address public eventManager;

  // tokenId => metadata URI
  mapping(uint256 => string) private _tokenURIs;
  
  // 记录所有已存在的tokenId（用于遍历）
  mapping(uint256 => bool) private _existsTokenIds;
  uint256[] private _allTokenIds;

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
  // 每个活动一个tokenId，一个活动中所有购票者持有的是同一种纪念品
  function mintEventCommemorative(
    address to,
    uint256 eventId,
    string memory metadataURI,
    uint256 amount
  ) external returns (uint256) {
    require(msg.sender == eventManager, "Only EventManager can mint");
    require(to != address(0), "Invalid recipient");
    require(amount > 0, "Amount must be greater than 0");

    // 使用eventId作为tokenId
    uint256 tokenId = eventId;

    if(bytes(_tokenURIs[tokenId]).length == 0) {
      _tokenURIs[tokenId] = metadataURI;
      _existsTokenIds[tokenId] = true;
      _allTokenIds.push(tokenId);
    }

    _mint(to, tokenId, amount, "");
    emit TicketMinted(eventId, tokenId, to, metadataURI, amount);
    return tokenId;
  }

  // IERC1155MetadataURI，重写uri函数，使纪念品具有元数据
  function uri(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "URI query for nonexistent token");
    return _tokenURIs[tokenId];
  }

  function _exists(uint256 tokenId) internal view returns (bool) {
    return bytes(_tokenURIs[tokenId]).length > 0;
  }

  // 获取用户拥有的所有纪念品信息
  function getUserTokens(address user) external view returns (uint256[] memory tokenIds, uint256[] memory amounts) {
    uint256 count = 0;
    
    // 先计算用户拥有的代币数量，所有活动的纪念品数量总和
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

  // 获取用户拥有的某个活动的纪念品数量
  function getUserTokenBalance(address user, uint256 eventId) external view returns (uint256) {
    return balanceOf(user, eventId);
  }


  // 纪念品意义，不值钱，如果未来变的值钱那么更好了，哈哈
  // 重写转账函数，使票务不可转让（Soulbound Token特性）
  // function _beforeTokenTransfer(
  //   address operator,
  //   address from,
  //   address to,
  //   uint256[] memory ids,
  //   uint256[] memory amounts,
  //   bytes memory data
  // ) internal override {
  //   // 如果from不是零地址（即不是铸造），则禁止转账
  //   if (from != address(0)) {
  //     revert("Tickets are non-transferable");
  //   }
  //   super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  // }
}
