import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Ticket, Calendar, Wallet, Hash } from "lucide-react"

export default function TicketDetailPage({ params }: { params: { tokenId: string } }) {
  // 示例数据
  const ticket = {
    tokenId: params.tokenId,
    eventId: 1,
    eventTitle: "Web3 开发者大会",
    eventImage: "/hero.jpg",
    ticketType: "GENERAL",
    ticketName: "普通票",
    balance: 2,
    metadataURI: "ipfs://Qm...",
    canTransfer: false,
    canRefund: true,
  }

  const purchaseRecords = [
    {
      timestamp: "2024-12-01 10:00",
      count: 1,
      totalCost: "0.1",
      txHash: "0xabc...def",
    },
    {
      timestamp: "2024-12-01 10:30",
      count: 1,
      totalCost: "0.1",
      txHash: "0x123...456",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/my/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回我的门票
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* 门票信息卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                <img
                  src={ticket.eventImage}
                  alt={ticket.eventTitle}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="mb-2">{ticket.ticketName}</CardTitle>
                <CardDescription>{ticket.eventTitle}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{ticket.ticketType}</Badge>
                  {ticket.canRefund && (
                    <Badge variant="outline">可退款</Badge>
                  )}
                  {ticket.canTransfer && (
                    <Badge variant="outline">可转让</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Token ID</span>
                </div>
                <div className="font-mono text-sm">{ticket.tokenId}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  <span>持有数量</span>
                </div>
                <div className="text-lg font-bold">{ticket.balance}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>活动 ID</span>
                </div>
                <div className="text-sm">{ticket.eventId}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>元数据 URI</span>
                </div>
                <div className="font-mono text-xs break-all">{ticket.metadataURI}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 购买记录 */}
        <Card>
          <CardHeader>
            <CardTitle>购买记录</CardTitle>
            <CardDescription>查看该门票的所有购买记录</CardDescription>
          </CardHeader>
          <CardContent>
            {purchaseRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>购买时间</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>总花费</TableHead>
                    <TableHead>交易哈希</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{record.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell>{record.count}</TableCell>
                      <TableCell className="font-medium">{record.totalCost} ETH</TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{record.txHash}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                暂无购买记录
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Link href={`/events/${ticket.eventId}`} className="flex-1">
            <Button variant="outline" className="w-full">
              查看活动详情
            </Button>
          </Link>
          {ticket.canRefund && (
            <Link href="/refund" className="flex-1">
              <Button variant="outline" className="w-full">
                申请退款
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

