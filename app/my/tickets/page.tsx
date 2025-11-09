import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Ticket, ArrowRight, RefreshCw } from "lucide-react"

export default function MyTicketsPage() {
  const tickets = [
    {
      eventId: 1,
      eventTitle: "Web3 开发者大会",
      eventImage: "/hero.jpg",
      ticketType: "GENERAL",
      ticketName: "普通票",
      balance: 2,
      tokenId: "1001",
      canRefund: true,
      canTransfer: false,
      purchaseTime: "2024-12-01 10:00",
    },
    {
      eventId: 1,
      eventTitle: "Web3 开发者大会",
      eventImage: "/hero.jpg",
      ticketType: "VIP",
      ticketName: "VIP票",
      balance: 1,
      tokenId: "1002",
      canRefund: true,
      canTransfer: false,
      purchaseTime: "2024-12-01 10:30",
    },
    {
      eventId: 2,
      eventTitle: "NFT 艺术展览",
      eventImage: "/hero.jpg",
      ticketType: "GENERAL",
      ticketName: "普通票",
      balance: 1,
      tokenId: "2001",
      canRefund: false,
      canTransfer: true,
      purchaseTime: "2024-12-15 14:00",
    },
  ]

  // 按活动分组
  const groupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.eventId]) {
      acc[ticket.eventId] = {
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        eventImage: ticket.eventImage,
        tickets: [],
      }
    }
    acc[ticket.eventId].tickets.push(ticket)
    return acc
  }, {} as Record<number, { eventId: number; eventTitle: string; eventImage: string; tickets: typeof tickets }>)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">我的门票</h1>
        <p className="text-muted-foreground mt-2">查看您持有的所有 NFT 门票</p>
      </div>

      {Object.values(groupedTickets).length > 0 ? (
        <div className="space-y-6">
          {Object.values(groupedTickets).map((group) => (
            <Card key={group.eventId}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <img
                      src={group.eventImage}
                      alt={group.eventTitle}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle>{group.eventTitle}</CardTitle>
                    <CardDescription>活动 ID: {group.eventId}</CardDescription>
                  </div>
                  <div className="ml-auto">
                    <Link href={`/events/${group.eventId}`}>
                      <Button variant="outline" size="sm">
                        查看活动
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.tickets.map((ticket, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{ticket.ticketName}</CardTitle>
                          <Badge variant="secondary">{ticket.ticketType}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">持有数量</span>
                          <span className="text-lg font-bold">{ticket.balance}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Token ID</span>
                          <span className="text-sm font-mono">{ticket.tokenId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">购买时间</span>
                          <span className="text-xs text-muted-foreground">{ticket.purchaseTime}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          {ticket.canRefund && (
                            <Badge variant="outline" className="text-xs">
                              可退款
                            </Badge>
                          )}
                          {ticket.canTransfer && (
                            <Badge variant="outline" className="text-xs">
                              可转让
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Link href={`/my/tickets/${ticket.tokenId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Ticket className="mr-2 h-4 w-4" />
                            查看详情
                          </Button>
                        </Link>
                        {ticket.canRefund && (
                          <Link href="/refund">
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">您还没有购买任何门票</p>
            <Link href="/">
              <Button>
                浏览活动
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

