"use client"

import React, { useState, useEffect } from "react"
import { useAccount, useNetwork } from "wagmi"
import { crossChainService, CrossChainEvent, CrossChainConfig } from "../../services/crosschain"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { Loader2, Globe, Calendar, Users, Ticket, ExternalLink } from "lucide-react"

interface CrossChainEventViewerProps {
  contract: any
}

export default function CrossChainEventViewer({ contract }: CrossChainEventViewerProps) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [selectedChainId, setSelectedChainId] = useState<number | null>(null)
  const [events, setEvents] = useState<CrossChainEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取支持的网络
  const supportedNetworks = crossChainService.getSupportedNetworks()

  // 处理链选择
  const handleChainChange = (chainId: string) => {
    setSelectedChainId(Number(chainId))
    setError(null)
  }

  // 加载跨链事件
  const loadCrossChainEvents = async () => {
    if (!selectedChainId || !contract) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const crossChainEvents = await crossChainService.getCrossChainEvents(selectedChainId, contract)
      setEvents(crossChainEvents)
    } catch (error: any) {
      console.error("加载跨链事件失败:", error)
      setError(`加载失败: ${error.message || "未知错误"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 当选择的链改变时重新加载
  useEffect(() => {
    if (selectedChainId) {
      loadCrossChainEvents()
    }
  }, [selectedChainId])

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("zh-CN")
  }

  // 格式化价格
  const formatPrice = (price: string) => {
    return `${Number(price) / 1e18} ETH`
  }

  // 获取网络信息
  const getNetworkInfo = (chainId: number): CrossChainConfig | undefined => {
    return crossChainService.getNetworkConfig(chainId)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            跨链事件查看
          </CardTitle>
          <CardDescription>请先连接钱包以查看跨链事件</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 链选择器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            跨链事件查看
          </CardTitle>
          <CardDescription>查看不同链上的活动事件</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择链</label>
              <Select onValueChange={handleChainChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择要查看的链" />
                </SelectTrigger>
                <SelectContent>
                  {supportedNetworks.map(network => (
                    <SelectItem key={network.chainId} value={network.chainId.toString()}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {network.name}
                        {network.isTestnet && (
                          <Badge variant="secondary" className="text-xs">
                            测试网
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedChainId && (
              <Button onClick={loadCrossChainEvents} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  "刷新事件"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 事件列表 */}
      {selectedChainId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              链 {selectedChainId} 上的事件 ({events.length})
            </h3>
            {getNetworkInfo(selectedChainId) && (
              <Badge variant="outline">{getNetworkInfo(selectedChainId)?.name}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">该链上暂无事件</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map(event => (
                <Card key={`${event.sourceChainId}-${event.id}`} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">事件 #{event.id}</CardTitle>
                        <CardDescription>来源链: {event.sourceChainId}</CardDescription>
                      </div>
                      <Badge variant={event.deleted ? "destructive" : "default"}>
                        {event.deleted ? "已删除" : "活跃"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 元数据URI */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">元数据URI</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 truncate text-xs bg-muted px-2 py-1 rounded">{event.metadataURI}</code>
                        <Button size="sm" variant="outline" asChild>
                          <a href={event.metadataURI} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* 活动信息 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>容量: {event.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          <span>已售: {event.seats}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>价格: {formatPrice(event.ticketCost)}</span>
                        </div>
                        <div className="text-muted-foreground">
                          所有者: {event.owner.slice(0, 6)}...{event.owner.slice(-4)}
                        </div>
                      </div>
                    </div>

                    {/* 时间信息 */}
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">开始时间:</span>
                        <div className="text-muted-foreground">{formatTimestamp(event.startsAt)}</div>
                      </div>
                      <div>
                        <span className="font-medium">结束时间:</span>
                        <div className="text-muted-foreground">{formatTimestamp(event.endsAt)}</div>
                      </div>
                    </div>

                    {/* 状态信息 */}
                    <div className="flex flex-wrap gap-1">
                      {event.paidOut && <Badge variant="secondary">已支付</Badge>}
                      {event.refunded && <Badge variant="secondary">已退款</Badge>}
                      {event.minted && <Badge variant="secondary">已铸造</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
