import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"

export default function HomePage() {
  // 示例数据 - 实际应该从合约获取
  const events = [
    {
      id: 1,
      title: "Web3 开发者大会",
      description: "探索区块链技术的最新发展",
      image: "/hero.jpg",
      startsAt: "2024-12-25 10:00",
      endsAt: "2024-12-25 18:00",
      status: "upcoming",
      priceRange: "0.1 - 0.5 ETH",
      remaining: 45,
      total: 100,
    },
    {
      id: 2,
      title: "NFT 艺术展览",
      description: "展示最新的数字艺术作品",
      image: "/hero.jpg",
      startsAt: "2024-12-20 14:00",
      endsAt: "2024-12-20 20:00",
      status: "ongoing",
      priceRange: "0.05 - 0.3 ETH",
      remaining: 12,
      total: 50,
    },
    {
      id: 3,
      title: "DeFi 研讨会",
      description: "深入了解去中心化金融",
      image: "/hero.jpg",
      startsAt: "2024-12-15 09:00",
      endsAt: "2024-12-15 17:00",
      status: "ended",
      priceRange: "0.2 - 0.8 ETH",
      remaining: 0,
      total: 200,
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">活动列表</h1>
          <p className="text-muted-foreground mt-2">发现并参与精彩的活动</p>
        </div>
        <Link href="/events/create">
          <Button>创建活动</Button>
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="mb-6 flex gap-4">
        <Button variant="outline" size="sm">全部</Button>
        <Button variant="ghost" size="sm">未开始</Button>
        <Button variant="ghost" size="sm">进行中</Button>
        <Button variant="ghost" size="sm">已结束</Button>
      </div>

      {/* 活动列表 */}
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
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{event.startsAt}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>线上活动</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.remaining} / {event.total}</span>
                </div>
                <div className="text-sm font-medium">
                  {event.priceRange}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${((event.total - event.remaining) / event.total) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/events/${event.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  查看详情
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {events.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">暂无活动</p>
          <Link href="/events/create">
            <Button className="mt-4">创建第一个活动</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
