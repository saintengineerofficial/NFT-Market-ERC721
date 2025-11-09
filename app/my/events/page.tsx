import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users, Settings, ArrowRight } from "lucide-react"

export default function MyEventsPage() {
  const events = [
    {
      id: 1,
      title: "Web3 开发者大会",
      image: "/hero.jpg",
      startsAt: "2024-12-25 10:00",
      endsAt: "2024-12-25 18:00",
      status: "upcoming",
      totalRevenue: "15.5",
      paidOut: false,
      totalTickets: 200,
      soldTickets: 95,
    },
    {
      id: 2,
      title: "NFT 艺术展览",
      image: "/hero.jpg",
      startsAt: "2024-12-20 14:00",
      endsAt: "2024-12-20 20:00",
      status: "ended",
      totalRevenue: "8.2",
      paidOut: true,
      totalTickets: 50,
      soldTickets: 50,
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
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">我的活动</h1>
        <p className="text-muted-foreground mt-2">管理您创建的所有活动</p>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-4 top-4">
                  {getStatusBadge(event.status)}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.startsAt}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">总收益</div>
                    <div className="font-semibold flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {event.totalRevenue} ETH
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">门票销售</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.soldTickets} / {event.totalTickets}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(event.soldTickets / event.totalTickets) * 100}%`,
                    }}
                  />
                </div>
                {event.status === "ended" && (
                  <div className="flex items-center gap-2">
                    {event.paidOut ? (
                      <Badge variant="outline">已提现</Badge>
                    ) : (
                      <Badge variant="default">待提现</Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/events/${event.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    查看详情
                  </Button>
                </Link>
                <Link href={`/events/${event.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">您还没有创建任何活动</p>
            <Link href="/events/create">
              <Button>
                创建第一个活动
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

