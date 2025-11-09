import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Users, Wallet, Edit, Settings, UserCheck, DollarSign, Trash2 } from "lucide-react"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // 示例数据
  const event = {
    id: params.id,
    title: "Web3 开发者大会",
    description: "探索区块链技术的最新发展，与行业专家面对面交流，了解最新的 DeFi、NFT 和 Web3 应用。",
    image: "/hero.jpg",
    owner: "0x1234...5678",
    startsAt: "2024-12-25 10:00",
    endsAt: "2024-12-25 18:00",
    status: "upcoming",
    isOwner: true,
    paidOut: false,
  }

  const ticketTypes = [
    {
      type: "GENERAL",
      name: "普通票",
      price: "0.1",
      sold: 45,
      capacity: 100,
      active: true,
    },
    {
      type: "VIP",
      name: "VIP票",
      price: "0.5",
      sold: 20,
      capacity: 50,
      active: true,
    },
    {
      type: "EARLY_BIRD",
      name: "早鸟票",
      price: "0.05",
      sold: 30,
      capacity: 50,
      active: false,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">未开始</Badge>
      case "ongoing":
        return <Badge variant="default">进行中</Badge>
      case "ended":
        return <Badge variant="outline">已结束</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 活动头部 */}
      <div className="mb-8">
        <div className="relative h-64 w-full overflow-hidden rounded-xl mb-6">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute right-4 top-4">
            {getStatusBadge(event.status)}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>开始: {event.startsAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>结束: {event.endsAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>主办方: {event.owner}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 主要内容区 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 门票类型列表 */}
          <Card>
            <CardHeader>
              <CardTitle>门票类型</CardTitle>
              <CardDescription>选择并购买您需要的门票</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <Card key={index} className={!ticket.active ? "opacity-50" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{ticket.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {ticket.type}
                        </CardDescription>
                      </div>
                      {!ticket.active && (
                        <Badge variant="outline">已停售</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{ticket.price} ETH</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          已售 {ticket.sold} / {ticket.capacity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          剩余 {ticket.capacity - ticket.sold}
                        </div>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted mt-2">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${(ticket.sold / ticket.capacity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {ticket.active && ticket.capacity > ticket.sold && event.status === "upcoming" && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="数量"
                          min="1"
                          max={ticket.capacity - ticket.sold}
                          className="flex-1"
                        />
                        <Button>购买</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 购买门票卡片 */}
          {event.status === "upcoming" && (
            <Card>
              <CardHeader>
                <CardTitle>购买门票</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>选择门票类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes
                        .filter((t) => t.active && t.capacity > t.sold)
                        .map((ticket) => (
                          <SelectItem key={ticket.type} value={ticket.type}>
                            {ticket.name} - {ticket.price} ETH
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>购买数量</Label>
                  <Input type="number" placeholder="1" min="1" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">总价</span>
                    <span className="font-semibold">0.1 ETH</span>
                  </div>
                </div>
                <Button className="w-full">确认购买</Button>
              </CardContent>
            </Card>
          )}

          {/* 主办方操作区 */}
          {event.isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>管理操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/events/${event.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    编辑活动
                  </Button>
                </Link>
                <Link href={`/events/${event.id}/tickets`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    管理门票类型
                  </Button>
                </Link>
                <Link href={`/events/${event.id}/checkers`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    管理检票员
                  </Button>
                </Link>
                {event.status === "ended" && !event.paidOut && (
                  <Link href={`/events/${event.id}/payout`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      提现收益
                    </Button>
                  </Link>
                )}
                {!event.paidOut && (
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除活动
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}

