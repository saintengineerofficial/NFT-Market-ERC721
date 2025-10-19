const { ethers } = require("hardhat")
const { getLzEndpoint, getChainId, getSupportedChains } = require("./layerzero-config")

async function main() {
  console.log("🚀 开始部署跨链 MK 合约...")

  // 获取网络信息
  const networkName = hre.network.name
  console.log(`📡 当前网络: ${networkName}`)

  // 获取 LayerZero 端点
  const lzEndpoint = getLzEndpoint(networkName)
  console.log(`🔗 LayerZero 端点: ${lzEndpoint}`)

  // 获取链ID
  const chainId = getChainId(networkName)
  console.log(`⛓️  链ID: ${chainId}`)

  // 获取部署者账户
  const [deployer] = await ethers.getSigners()
  console.log(`👤 部署者地址: ${deployer.address}`)
  console.log(`💰 部署者余额: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`)

  // 部署合约
  const CrossChainMK = await ethers.getContractFactory("CrossChainMK")
  const crossChainMK = await CrossChainMK.deploy(lzEndpoint, 5) // 5% 服务费

  await crossChainMK.waitForDeployment()
  const contractAddress = await crossChainMK.getAddress()

  console.log(`✅ 跨链 MK 合约已部署到: ${contractAddress}`)
  console.log(`📋 合约信息:`)
  console.log(`   - 网络: ${networkName}`)
  console.log(`   - 地址: ${contractAddress}`)
  console.log(`   - 链ID: ${chainId}`)
  console.log(`   - LayerZero 端点: ${lzEndpoint}`)

  // 验证合约部署
  console.log(`🔍 验证合约部署...`)
  const owner = await crossChainMK.owner()
  const servicePct = await crossChainMK.servicePct()

  console.log(`   - 合约所有者: ${owner}`)
  console.log(`   - 服务费比例: ${servicePct}%`)

  // 保存部署信息
  const deploymentInfo = {
    network: networkName,
    chainId: chainId,
    contractAddress: contractAddress,
    lzEndpoint: lzEndpoint,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    servicePct: Number(servicePct),
  }

  // 保存到文件
  const fs = require("fs")
  const path = require("path")
  const deploymentsDir = path.join(__dirname, "..", "deployments")

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true })
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}-crosschain.json`)
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2))

  console.log(`💾 部署信息已保存到: ${deploymentFile}`)

  // 显示支持的跨链网络
  const supportedChains = getSupportedChains(networkName.includes("test") || networkName.includes("goerli"))
  console.log(`🌐 支持的跨链网络: ${supportedChains.join(", ")}`)

  console.log(`\n🎉 跨链 MK 合约部署完成！`)
  console.log(`\n📝 下一步操作:`)
  console.log(`   1. 在其他链上部署相同的合约`)
  console.log(`   2. 设置可信远程地址`)
  console.log(`   3. 测试跨链功能`)
  console.log(`   4. 更新前端配置`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ 部署失败:", error)
    process.exit(1)
  })
