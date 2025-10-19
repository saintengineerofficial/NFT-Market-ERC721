const { ethers } = require("hardhat")
const { getLzEndpoint, getChainId, getSupportedChains } = require("./layerzero-config")
const fs = require("fs")
const path = require("path")

async function main() {
  console.log("🔧 开始配置跨链连接...")

  // 获取网络信息
  const networkName = hre.network.name
  console.log(`📡 当前网络: ${networkName}`)

  // 读取部署信息
  const deploymentsDir = path.join(__dirname, "..", "deployments")
  const deploymentFile = path.join(deploymentsDir, `${networkName}-crosschain.json`)

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`部署文件不存在: ${deploymentFile}`)
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"))
  console.log(`📋 部署信息:`, deploymentInfo)

  // 获取合约实例
  const CrossChainMK = await ethers.getContractFactory("CrossChainMK")
  const crossChainMK = CrossChainMK.attach(deploymentInfo.contractAddress)

  // 获取部署者账户
  const [deployer] = await ethers.getSigners()
  console.log(`👤 配置者地址: ${deployer.address}`)

  // 获取支持的链列表
  const isTestnet = networkName.includes("test") || networkName.includes("goerli")
  const supportedChains = getSupportedChains(isTestnet)
  console.log(`🌐 支持的链: ${supportedChains.join(", ")}`)

  // 配置可信远程地址
  console.log(`\n🔗 配置可信远程地址...`)

  for (const targetChain of supportedChains) {
    if (targetChain === networkName.toLowerCase()) {
      continue // 跳过当前链
    }

    try {
      const targetChainId = getChainId(targetChain)
      const targetLzEndpoint = getLzEndpoint(targetChain)

      console.log(`\n📡 配置链: ${targetChain} (ID: ${targetChainId})`)

      // 构造可信远程地址
      // 注意：这里需要目标链的合约地址，实际使用时需要从目标链的部署文件中获取
      const targetContractAddress = "0x0000000000000000000000000000000000000000" // 占位符
      const trustedRemote = ethers.solidityPacked(
        ["address", "address"],
        [targetContractAddress, deploymentInfo.contractAddress]
      )

      // 设置可信远程地址
      const tx = await crossChainMK.setTrustedRemote(targetChainId, trustedRemote)
      await tx.wait()

      console.log(`   ✅ 可信远程地址已设置`)
      console.log(`   📋 交易哈希: ${tx.hash}`)
    } catch (error) {
      console.log(`   ❌ 配置失败: ${error.message}`)
    }
  }

  // 验证配置
  console.log(`\n🔍 验证跨链配置...`)

  try {
    const owner = await crossChainMK.owner()
    console.log(`   ✅ 合约所有者: ${owner}`)

    // 检查 LayerZero 端点
    const lzEndpoint = await crossChainMK.lzEndpoint()
    console.log(`   ✅ LayerZero 端点: ${lzEndpoint}`)
  } catch (error) {
    console.log(`   ❌ 验证失败: ${error.message}`)
  }

  // 保存配置信息
  const configInfo = {
    network: networkName,
    chainId: deploymentInfo.chainId,
    contractAddress: deploymentInfo.contractAddress,
    lzEndpoint: deploymentInfo.lzEndpoint,
    configuredChains: supportedChains.filter(chain => chain !== networkName.toLowerCase()),
    configurationTime: new Date().toISOString(),
  }

  const configFile = path.join(deploymentsDir, `${networkName}-crosschain-config.json`)
  fs.writeFileSync(configFile, JSON.stringify(configInfo, null, 2))

  console.log(`💾 配置信息已保存到: ${configFile}`)

  console.log(`\n🎉 跨链配置完成！`)
  console.log(`\n📝 下一步操作:`)
  console.log(`   1. 在其他链上部署合约`)
  console.log(`   2. 更新目标链的合约地址`)
  console.log(`   3. 重新运行配置脚本`)
  console.log(`   4. 测试跨链功能`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ 配置失败:", error)
    process.exit(1)
  })
