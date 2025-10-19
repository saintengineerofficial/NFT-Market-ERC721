"use client"

import React, { useState, useEffect } from "react"
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi"
import { crossChainService, CrossChainConfig } from "../../services/crosschain"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { Loader2, Globe, ArrowRight } from "lucide-react"

interface CrossChainEventCreatorProps {
  contract: any
  onEventCreated?: (eventId: number, chainId: number) => void
}

export default function CrossChainEventCreator({ contract, onEventCreated }: CrossChainEventCreatorProps) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const [formData, setFormData] = useState({
    metadataURI: "",
    capacity: "",
    ticketCost: "",
    startsAt: "",
    endsAt: "",
  })

  const [targetChainId, setTargetChainId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 获取支持的目标网络
  const targetNetworks = chain ? crossChainService.getTargetNetworks(chain.id) : []

  // 处理表单输入
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // 处理目标链选择
  const handleTargetChainChange = (chainId: string) => {
    setTargetChainId(Number(chainId))
    setError(null)
  }

  // 验证表单
  const validateForm = () => {
    if (!formData.metadataURI.trim()) {
      setError("请输入元数据URI")
      return false
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      setError("请输入有效的容量")
      return false
    }
    if (!formData.ticketCost || Number(formData.ticketCost) <= 0) {
      setError("请输入有效的门票价格")
      return false
    }
    if (!formData.startsAt || Number(formData.startsAt) <= 0) {
      setError("请输入有效的开始时间")
      return false
    }
    if (!formData.endsAt || Number(formData.endsAt) <= Number(formData.startsAt)) {
      setError("结束时间必须大于开始时间")
      return false
    }
    if (!targetChainId) {
      setError("请选择目标链")
      return false
    }
    return true
  }

  // 创建跨链事件
  const handleCreateEvent = async () => {
    if (!isConnected || !address || !contract) {
      setError("请先连接钱包")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const tx = await crossChainService.createCrossChainEvent(
        targetChainId!,
        formData.metadataURI,
        Number(formData.capacity),
        formData.ticketCost,
        Number(formData.startsAt),
        Number(formData.endsAt),
        contract,
        // 这里需要传入 signer，实际使用时需要从 wagmi 获取
        null
      )

      await tx.wait()

      setSuccess(`跨链事件创建成功！交易哈希: ${tx.hash}`)

      // 重置表单
      setFormData({
        metadataURI: "",
        capacity: "",
        ticketCost: "",
        startsAt: "",
        endsAt: "",
      })
      setTargetChainId(null)

      // 回调通知
      if (onEventCreated) {
        onEventCreated(0, targetChainId!) // 事件ID需要从交易结果中获取
      }
    } catch (error: any) {
      console.error("创建跨链事件失败:", error)
      setError(`创建失败: ${error.message || "未知错误"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取当前时间戳
  const getCurrentTimestamp = () => {
    return Math.floor(Date.now() / 1000)
  }

  // 设置默认时间
  useEffect(() => {
    const now = getCurrentTimestamp()
    const oneHourLater = now + 3600
    const twoHoursLater = now + 7200

    setFormData(prev => ({
      ...prev,
      startsAt: oneHourLater.toString(),
      endsAt: twoHoursLater.toString(),
    }))
  }, [])

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            跨链事件创建
          </CardTitle>
          <CardDescription>请先连接钱包以创建跨链事件</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          跨链事件创建
        </CardTitle>
        <CardDescription>在目标链上创建活动，实现跨链互操作性</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 目标链选择 */}
        <div className="space-y-2">
          <Label htmlFor="targetChain">目标链</Label>
          <Select onValueChange={handleTargetChainChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择目标链" />
            </SelectTrigger>
            <SelectContent>
              {targetNetworks.map(network => (
                <SelectItem key={network.chainId} value={network.chainId.toString()}>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {network.name}
                    {network.isTestnet && <span className="text-xs text-muted-foreground">(测试网)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 元数据URI */}
        <div className="space-y-2">
          <Label htmlFor="metadataURI">元数据URI</Label>
          <Input
            id="metadataURI"
            placeholder="ipfs://Qm..."
            value={formData.metadataURI}
            onChange={e => handleInputChange("metadataURI", e.target.value)}
          />
        </div>

        {/* 容量 */}
        <div className="space-y-2">
          <Label htmlFor="capacity">容量</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="100"
            value={formData.capacity}
            onChange={e => handleInputChange("capacity", e.target.value)}
          />
        </div>

        {/* 门票价格 */}
        <div className="space-y-2">
          <Label htmlFor="ticketCost">门票价格 (ETH)</Label>
          <Input
            id="ticketCost"
            type="number"
            step="0.01"
            placeholder="0.1"
            value={formData.ticketCost}
            onChange={e => handleInputChange("ticketCost", e.target.value)}
          />
        </div>

        {/* 开始时间 */}
        <div className="space-y-2">
          <Label htmlFor="startsAt">开始时间 (Unix时间戳)</Label>
          <Input
            id="startsAt"
            type="number"
            placeholder={getCurrentTimestamp().toString()}
            value={formData.startsAt}
            onChange={e => handleInputChange("startsAt", e.target.value)}
          />
        </div>

        {/* 结束时间 */}
        <div className="space-y-2">
          <Label htmlFor="endsAt">结束时间 (Unix时间戳)</Label>
          <Input
            id="endsAt"
            type="number"
            placeholder={(getCurrentTimestamp() + 3600).toString()}
            value={formData.endsAt}
            onChange={e => handleInputChange("endsAt", e.target.value)}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 成功提示 */}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* 创建按钮 */}
        <Button onClick={handleCreateEvent} disabled={isLoading || !targetChainId} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              创建跨链事件
            </>
          )}
        </Button>

        {/* 提示信息 */}
        <div className="text-sm text-muted-foreground">
          <p>• 跨链事件将在目标链上创建</p>
          <p>• 需要支付跨链 Gas 费用</p>
          <p>• 事件创建后可在目标链上查看和购买门票</p>
        </div>
      </CardContent>
    </Card>
  )
}
